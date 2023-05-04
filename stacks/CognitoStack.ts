import { Duration } from "aws-cdk-lib";
import {
    AccountRecovery,
    ClientAttributes,
    StringAttribute,
    UserPool,
    UserPoolClient,
    UserPoolEmail,
} from "aws-cdk-lib/aws-cognito";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Function, StackContext } from "sst/constructs";
import { getDomain, isSandbox } from "./utils";

export const CognitoStack = ({ stack }: StackContext) => {
    const domain = isSandbox(stack.stage) ? "http://localhost:3000" : getDomain(stack.stage);

    const customEmailLambda = new Function(stack, "cdd-custom-email-cognito-trigger", {
        functionName: `cdd-custom-email-cognito-trigger-${stack.stage}`,
        environment: {
            REGISTRATION_LINK: `${domain}/register`,
            FORGOTTEN_PASSWORD_LINK: `${domain}/reset-password`,
            CONTACT_LINK: `${domain}/contact`,
        },
        handler: "packages/cognito-triggers/custom-email-trigger/index.main",
        timeout: 60,
        memorySize: 256,
        runtime: "python3.9",
        enableLiveDev: false,
    });

    const userPool = new UserPool(stack, "cdd-user-pool", {
        userPoolName: `cdd-user-pool-${stack.stage}`,
        customAttributes: {
            orgId: new StringAttribute({ minLen: 1, mutable: true }),
        },
        standardAttributes: {
            email: {
                required: true,
            },
        },
        signInAliases: {
            email: true,
        },
        signInCaseSensitive: false,
        passwordPolicy: {
            minLength: 8,
            requireDigits: false,
            requireLowercase: false,
            requireSymbols: false,
            requireUppercase: false,
            tempPasswordValidity: Duration.days(3),
        },
        email: isSandbox(stack.stage)
            ? UserPoolEmail.withCognito()
            : UserPoolEmail.withSES({
                  fromEmail: `noreply@${domain}`,
                  fromName: "Create Transport Disruption Data Service",
                  sesVerifiedDomain: domain,
              }),
        selfSignUpEnabled: false,
        accountRecovery: AccountRecovery.EMAIL_ONLY,
        autoVerify: {
            email: true,
        },
        deletionProtection: stack.stage === "prod",
        lambdaTriggers: {
            customMessage: customEmailLambda,
        },
    });

    const client = new UserPoolClient(stack, "cdd-site-client", {
        userPool,
        userPoolClientName: `cdd-site-client-${stack.stage}`,
        accessTokenValidity: Duration.minutes(20),
        idTokenValidity: Duration.minutes(20),
        refreshTokenValidity: Duration.days(1),
        authFlows: {
            adminUserPassword: true,
        },
        generateSecret: true,
        readAttributes: new ClientAttributes()
            .withStandardAttributes({ email: true, emailVerified: true })
            .withCustomAttributes("orgId"),
        writeAttributes: new ClientAttributes().withStandardAttributes({ email: true }).withCustomAttributes("orgId"),
        preventUserExistenceErrors: true,
    });

    const clientSecretParam = new Secret(stack, "cdd-site-client-secret", {
        secretName: `cdd-site-client-secret-${stack.stage}`,
        secretStringValue: client.userPoolClientSecret,
    });

    return {
        clientId: client.userPoolClientId,
        clientSecretArn: clientSecretParam.secretFullArn,
    };
};
