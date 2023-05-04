import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NextjsSite, StackContext, use } from "sst/constructs";
import { CognitoStack } from "./CognitoStack";
import { DnsStack } from "./DnsStack";
import { DynamoDBStack } from "./DynamoDBStack";
import { getDomain } from "./utils";

export function SiteStack({ stack }: StackContext) {
    const { table, siriTable } = use(DynamoDBStack);
    const { hostedZone } = use(DnsStack);
    const { clientId, clientSecret, cognitoIssuer, userPoolId, userPoolArn } = use(CognitoStack);

    const apiUrl = !["preprod", "prod"].includes(stack.stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1"
        : `https://api.${stack.stage}.ref-data.dft-create-data.com/v1`;

    const site = new NextjsSite(stack, "Site", {
        path: "site/",
        environment: {
            TABLE_NAME: table.tableName,
            SIRI_TABLE_NAME: siriTable.tableName,
            STAGE: stack.stage,
            API_BASE_URL: apiUrl,
            MAP_BOX_ACCESS_TOKEN: process.env.MAP_BOX_ACCESS_TOKEN || "",
            FEEDBACK_EMAIL_ADDRESS: stack.stage === "prod" ? "bodshelpdesk@kpmg.co.uk" : "feedback@dft-create-data.com",
            AWS_SES_IDENTITY_ARN: process.env.AWS_SES_IDENTITY_ARN || "",
            COGNITO_CLIENT_ID: clientId,
            COGNITO_CLIENT_SECRET: clientSecret.toString(),
            COGNITO_ISSUER: cognitoIssuer,
            COGNITO_USER_POOL_ID: userPoolId,
        },
        customDomain: {
            domainName: getDomain(stack.stage),
            hostedZone: hostedZone.zoneName,
        },
        permissions: [
            new PolicyStatement({
                resources: [table.tableArn, siriTable.tableArn],
                actions: [
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:BatchGetItem",
                    "dynamodb:BatchWriteItem",
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
                ],
            }),
        ],
    });

    stack.addOutputs({
        URL: site.url || "",
    });
}
