import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Bucket, NextjsSite, StackContext, Table } from "sst/constructs";

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
        cdk: {
            table: {
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
            },
        },
    });
}
