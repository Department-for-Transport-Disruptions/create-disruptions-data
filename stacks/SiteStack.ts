import { AccessKey, ManagedPolicy, PolicyStatement, User } from "aws-cdk-lib/aws-iam";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { NextjsSite, StackContext, use } from "sst/constructs";
import { CognitoStack } from "./CognitoStack";
import { DnsStack } from "./DnsStack";
import { DynamoDBStack } from "./DynamoDBStack";
import { createBucket } from "./services/Buckets";
import { getDomain } from "./utils";

export function SiteStack({ stack }: StackContext) {
    const { table, siriTable, organisationsTable } = use(DynamoDBStack);
    const { hostedZone } = use(DnsStack);
    const { clientId, clientSecret, cognitoIssuer, userPoolId, userPoolArn } = use(CognitoStack);

    const siteImageBucket = createBucket(stack, "cdd-image-bucket", true);

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
        warm: stack.stage === "prod" || stack.stage === "preprod" ? 50 : 10,
        environment: {
            TABLE_NAME: table.tableName,
            SIRI_TABLE_NAME: siriTable.tableName,
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
        },
        customDomain: {
            domainName: getDomain(stack.stage),
            hostedZone: hostedZone.zoneName,
        },
        permissions: [
            new PolicyStatement({
                resources: [`${siteImageBucket.bucketArn}/*`],
                actions: ["s3:GetObject", "s3:PutObject"],
            }),
            new PolicyStatement({
                resources: [table.tableArn, siriTable.tableArn, organisationsTable.tableArn],
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
                ],
            }),
        ],
    });

    stack.addOutputs({
        URL: site.url || "",
    });
}
