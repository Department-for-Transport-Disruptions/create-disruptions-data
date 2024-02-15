import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Cron, Function, StackContext, use } from "sst/constructs";
import { CognitoStack } from "./CognitoStack";
import { DynamoDBStack } from "./DynamoDBStack";

export const RoadworksNotificationStack = ({ stack }: StackContext) => {
    const { disruptionsTable, organisationsTableV2: organisationsTable } = use(DynamoDBStack);
    const { clientId, clientSecret, userPoolId, userPoolArn } = use(CognitoStack);

    const apiUrl = !["preprod", "prod"].includes(stack.stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1"
        : `https://api.${stack.stage}.ref-data.dft-create-data.com/v1`;

    const url =
        stack.stage === "prod"
            ? "https://disruption-data.dft.gov.uk"
            : !["preprod", "test"].includes(stack.stage)
            ? "http://localhost:3000"
            : `https://${stack.stage}.cdd.dft-create-data.com`;

    const cancelledRoadworkNotification = new Function(stack, "cdd-roadworks-cancelled-notification", {
        functionName: `cdd-roadworks-cancelled-notification-${stack.stage}`,
        environment: {
            DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
            ORGANISATIONS_TABLE_NAME: organisationsTable.tableName,
            API_BASE_URL: apiUrl,
            COGNITO_CLIENT_ID: clientId,
            COGNITO_CLIENT_SECRET: clientSecret.toString(),
            COGNITO_USER_POOL_ID: userPoolId,
            DOMAIN_NAME: url,
            STAGE: stack.stage,
        },
        handler: "packages/roadworks-cancelled-notification/index.main",
        permissions: [
            new PolicyStatement({
                resources: ["*"],
                actions: ["ses:SendEmail", "ses:SendRawEmail"],
            }),
            new PolicyStatement({
                resources: [disruptionsTable.tableArn],
                actions: ["dynamodb:Scan"],
            }),
            new PolicyStatement({
                resources: [userPoolArn],
                actions: ["cognito-idp:ListUsersInGroup"],
            }),
        ],
        timeout: 60,
        memorySize: 1536,
        runtime: "nodejs20.x",
    });

    new Cron(stack, "cdd-roadworks-cancelled-notification-cron", {
        job: cancelledRoadworkNotification,
        schedule: `rate(${stack.stage === "prod" || stack.stage === "preprod" ? "1 minute" : "5 minutes"})`,
    });

    const newRoadworkNotification = new Function(stack, "cdd-roadworks-new-notification", {
        functionName: `cdd-roadworks-new-notification-${stack.stage}`,
        environment: {
            API_BASE_URL: apiUrl,
            COGNITO_CLIENT_ID: clientId,
            COGNITO_CLIENT_SECRET: clientSecret.toString(),
            COGNITO_USER_POOL_ID: userPoolId,
            DOMAIN_NAME: url,
            STAGE: stack.stage,
        },
        handler: "packages/roadworks-cancelled-notification/index.main",
        permissions: [
            new PolicyStatement({
                resources: ["*"],
                actions: ["ses:SendEmail", "ses:SendRawEmail"],
            }),
            new PolicyStatement({
                resources: [userPoolArn],
                actions: ["cognito-idp:ListUsersInGroup"],
            }),
        ],
        timeout: 60,
        memorySize: 1536,
        runtime: "nodejs20.x",
    });

    new Cron(stack, "cdd-roadworks-new-notification-cron", {
        job: newRoadworkNotification,
        schedule: `cron(${stack.stage === "prod" || stack.stage === "preprod" ? "0 8 * * *" : "0 8 * * *"})`,
    });
};
