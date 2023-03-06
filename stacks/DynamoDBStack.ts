import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { StackContext, Table } from "sst/constructs";

export function DynamoDBStack({ stack }: StackContext) {
    const table = new Table(stack, "cdd-dynamodb-disruptions-table", {
        fields: {
            PK: "string",
            SK: "string",
        },
        primaryIndex: {
            partitionKey: "PK",
            sortKey: "SK",
        },
        stream: "new_image",
        cdk: {
            table: {
                tableName: `cdd-disruptions-table-${stack.stage}`,
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
            },
        },
    });

    return {
        table,
    };
}
