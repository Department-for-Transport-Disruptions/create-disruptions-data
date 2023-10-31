import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { StackContext, Table } from "sst/constructs";

export const DynamoDBStack = ({ stack }: StackContext) => {
    const disruptionsTable = new Table(stack, "cdd-dynamodb-disruptions-table", {
        fields: {
            PK: "string",
            SK: "string",
        },
        primaryIndex: {
            partitionKey: "PK",
            sortKey: "SK",
        },
        cdk: {
            table: {
                tableName: `cdd-disruptions-table-${stack.stage}`,
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
            },
        },
    });

    const templateDisruptionsTable = new Table(stack, "cdd-dynamodb-template-disruptions-table", {
        fields: {
            PK: "string",
            SK: "string",
        },
        primaryIndex: {
            partitionKey: "PK",
            sortKey: "SK",
        },
        cdk: {
            table: {
                tableName: `cdd-template-disruptions-table-${stack.stage}`,
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
            },
        },
    });

    const organisationsTable = new Table(stack, "cdd-dynamodb-organisations-table", {
        fields: {
            PK: "string",
        },
        primaryIndex: {
            partitionKey: "PK",
        },
        cdk: {
            table: {
                tableName: `cdd-organisations-table-${stack.stage}`,
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
            },
        },
    });

    const organisationsTableV2 = new Table(stack, "cdd-dynamodb-organisations-v2-table", {
        fields: {
            PK: "string",
            SK: "string",
        },
        primaryIndex: {
            partitionKey: "PK",
            sortKey: "SK",
        },
        cdk: {
            table: {
                tableName: `cdd-organisations-v2-table-${stack.stage}`,
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
            },
        },
    });

    return {
        disruptionsTable,
        organisationsTable,
        organisationsTableV2,
        templateDisruptionsTable,
    };
};
