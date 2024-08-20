import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { AccessKey, ManagedPolicy, PolicyStatement, User } from "aws-cdk-lib/aws-iam";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Cron, Function, NextjsSite, StackContext, use } from "sst/constructs";
import { getDomain, isSandbox } from "../shared-ts/utils/domain";
import { CognitoStack } from "./CognitoStack";
import { DynamoDBStack } from "./DynamoDBStack";
import { OrgDisruptionsGeneratorStack } from "./OrgDisruptionsGenerator";
import { createBucket } from "./utils";
import { TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { MonitoringStack } from "./MonitoringStack";

export const SiteStack = ({ stack }: StackContext) => {
    const { disruptionsTable, organisationsTableV2: organisationsTable, templateDisruptionsTable } = use(DynamoDBStack);
    const { clientId, clientSecret, cognitoIssuer, userPoolId, userPoolArn } = use(CognitoStack);
    const { orgDisruptionsBucket } = use(OrgDisruptionsGeneratorStack);
    const { alarmTopic } = use(MonitoringStack);

    const siteImageBucket = createBucket(stack, "cdd-image-bucket", true);

    let prodDomain = "";
    let prodCertArn = "";

    if (stack.stage === "prod") {
        prodDomain = process.env.PROD_DOMAIN?.toString() ?? "";
        prodCertArn = process.env.PROD_CERT_ARN?.toString() ?? "";

        if (!prodDomain) {
            throw new Error("PROD_DOMAIN must be set in production");
        }
    }

    const apiUrl = !["preprod", "prod"].includes(stack.stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1"
        : `https://api.${stack.stage}.ref-data.dft-create-data.com/v1`;

    const middlewareCognitoUser = new User(stack, "cdd-site-middleware-user", {
        userName: `cdd-site-middleware-user-${stack.stage}-${stack.region}`,
        managedPolicies: [
            new ManagedPolicy(stack, "cdd-site-middleware-user-policy", {
                statements: [
                    new PolicyStatement({
                        resources: [userPoolArn],
                        actions: ["cognito-idp:AdminInitiateAuth", "cognito-idp:AdminUserGlobalSignOut"],
                    }),
                ],
            }),
        ],
    });

    const middlewareCognitoUserAccessKey = new AccessKey(stack, "cdd-site-middleware-user-creds", {
        user: middlewareCognitoUser,
    });

    const middlewareCognitoUserSecret = new Secret(stack, "cdd-site-middleware-user-creds-secret", {
        secretStringValue: middlewareCognitoUserAccessKey.secretAccessKey,
    });

    const site = new NextjsSite(stack, "Site", {
        path: "site/",
        runtime: "nodejs20.x",
        warm: stack.stage === "prod" || stack.stage === "preprod" ? 50 : 10,
        dev: {
            deploy: false,
        },
        environment: {
            DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
            TEMPLATE_DISRUPTIONS_TABLE_NAME: templateDisruptionsTable.tableName,
            ORGANISATIONS_TABLE_NAME: organisationsTable.tableName,
            STAGE: stack.stage,
            API_BASE_URL: apiUrl,
            MAP_BOX_ACCESS_TOKEN: process.env.MAP_BOX_ACCESS_TOKEN || "",
            FEEDBACK_EMAIL_ADDRESS: stack.stage === "prod" ? "bodshelpdesk@kpmg.co.uk" : "feedback@dft-create-data.com",
            AWS_SES_IDENTITY_ARN: process.env.AWS_SES_IDENTITY_ARN || "",
            COGNITO_CLIENT_ID: clientId,
            COGNITO_CLIENT_SECRET: clientSecret.toString(),
            COGNITO_ISSUER: cognitoIssuer,
            COGNITO_USER_POOL_ID: userPoolId,
            MIDDLEWARE_AWS_ACCESS_KEY_ID: middlewareCognitoUserAccessKey.accessKeyId,
            MIDDLEWARE_AWS_SECRET_ACCESS_KEY: middlewareCognitoUserSecret.secretValue.toString(),
            IMAGE_BUCKET_NAME: siteImageBucket.bucketName,
            DOMAIN_NAME: `${isSandbox(stack.stage) ? "http://" : "https://"}${
                isSandbox(stack.stage) ? "localhost:3000" : getDomain(stack.stage)
            }`,
            ORG_DISRUPTIONS_BUCKET_NAME: orgDisruptionsBucket.bucketName,
        },
        customDomain: {
            domainName:
                stack.stage === "prod"
                    ? prodDomain
                    : isSandbox(stack.stage)
                      ? `${stack.stage}.${getDomain(stack.stage)}`
                      : getDomain(stack.stage),
            hostedZone: stack.stage !== "prod" ? getDomain(stack.stage) : undefined,
            isExternalDomain: stack.stage === "prod",
            cdk:
                stack.stage === "prod"
                    ? {
                          certificate: Certificate.fromCertificateArn(stack, "cdd-prod-certificate", prodCertArn),
                      }
                    : undefined,
        },
        permissions: [
            new PolicyStatement({
                resources: [`${siteImageBucket.bucketArn}/*`],
                actions: ["s3:GetObject", "s3:PutObject"],
            }),
            new PolicyStatement({
                resources: [`${orgDisruptionsBucket.bucketArn}/*`],
                actions: ["s3:GetObject"],
            }),
            new PolicyStatement({
                resources: [disruptionsTable.tableArn, organisationsTable.tableArn, templateDisruptionsTable.tableArn],
                actions: [
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:BatchGetItem",
                    "dynamodb:BatchWriteItem",
                    "dynamodb:Scan",
                ],
            }),
            new PolicyStatement({
                resources: ["*"],
                actions: ["ses:SendEmail", "ses:SendRawEmail"],
            }),
            new PolicyStatement({
                resources: [`arn:aws:ssm:${stack.region}:${stack.account}:parameter/social/*`],
                actions: ["ssm:GetParameter", "ssm:PutParameter", "ssm:DeleteParameter", "ssm:GetParametersByPath"],
            }),
            new PolicyStatement({
                resources: ["*"],
                actions: [
                    "cognito-idp:ForgotPassword",
                    "cognito-idp:ConfirmForgotPassword",
                    "cognito-idp:ChangePassword",
                    "cognito-idp:ListUserPools",
                ],
            }),
            new PolicyStatement({
                resources: [userPoolArn],
                actions: [
                    "cognito-idp:AdminInitiateAuth",
                    "cognito-idp:AdminUserGlobalSignOut",
                    "cognito-idp:DescribeUserPool",
                    "cognito-idp:AdminRespondToAuthChallenge",
                    "cognito-idp:AdminUpdateUserAttributes",
                    "cognito-idp:AdminGetUser",
                    "cognito-idp:AdminSetUserPassword",
                    "cognito-idp:ListUserPoolClients",
                    "cognito-idp:DescribeUserPoolClient",
                    "cognito-idp:ListUsers",
                    "cognito-idp:ListGroups",
                    "cognito-idp:AdminAddUserToGroup",
                    "cognito-idp:AdminDeleteUser",
                    "cognito-idp:AdminCreateUser",
                    "cognito-idp:ListUsersInGroup",
                    "cognito-idp:AdminListGroupsForUser",
                    "cognito-idp:AdminRemoveUserFromGroup",
                ],
            }),
        ],
    });

    stack.addOutputs({
        URL: site.url || "",
    });

    const nextDoorTokenRefresher = new Function(stack, "cdd-nextdoor-token-refresher", {
        functionName: `cdd-nextdoor-token-refresher-${stack.stage}`,
        permissions: [
            new PolicyStatement({
                resources: [
                    `arn:aws:ssm:${stack.region}:${stack.account}:parameter/social/nextdoor*`,
                    `arn:aws:ssm:${stack.region}:${stack.account}:parameter/social/nextdoor/*`,
                ],
                actions: ["ssm:GetParameter", "ssm:PutParameter", "ssm:DeleteParameter", "ssm:GetParametersByPath"],
            }),
        ],
        handler: "packages/nextdoor-token-refresher/index.main",
        timeout: 60,
        memorySize: 1536,
        runtime: "nodejs20.x",
    });

    new Cron(stack, "nextdoor-token-refresher-cron", {
        job: nextDoorTokenRefresher,
        schedule: "rate(4 hours)",
    });

    nextDoorTokenRefresher
        .metric("Errors")
        .createAlarm(stack, "cdd-nextdoor-token-refresher-failure-alarm", {
            evaluationPeriods: 1,
            threshold: 1,
            treatMissingData: TreatMissingData.NOT_BREACHING,
            alarmName: `cdd-nextdoor-token-refresher-failure-alarm-${stack.stage}`,
        })
        .addAlarmAction(new SnsAction(alarmTopic));
};
