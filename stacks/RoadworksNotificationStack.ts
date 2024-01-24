import { Cron, Function, StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";

export const RoadworksNotificationStack = ({ stack }: StackContext) => {
    const { disruptionsTable, organisationsTableV2: organisationsTable } = use(DynamoDBStack);

    const apiUrl = !["preprod", "prod"].includes(stack.stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1"
        : `https://api.${stack.stage}.ref-data.dft-create-data.com/v1`;

    const cancelledRoadworkNotification = new Function(stack, "cdd-roadworks-cancelled-notification", {
        functionName: `cdd-roadworks-cancelled-notification-${stack.stage}`,
        environment: {
            DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
            ORGANISATIONS_TABLE_NAME: organisationsTable.tableName,
            API_BASE_URL: apiUrl,
        },
        handler: "packages/roadworks-cancelled-notification/index.main",
        timeout: 60,
        memorySize: 1536,
        runtime: "nodejs20.x",
    });

    new Cron(stack, "cdd-roadworks-cancelled-notification-cron", {
        job: cancelledRoadworkNotification,
        schedule: `rate(${stack.stage === "prod" || stack.stage === "preprod" ? "1 minute" : "5 minutes"})`,
    });
};
