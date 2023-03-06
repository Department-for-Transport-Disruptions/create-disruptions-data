import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NextjsSite, StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";

export function SiteStack({ stack }: StackContext) {
    const { table } = use(DynamoDBStack);

    const site = new NextjsSite(stack, "Site", {
        path: "site/",
        environment: {
            TABLE_ARN: table.tableArn,
        },
        permissions: [
            new PolicyStatement({
                resources: [table.tableArn],
                actions: [
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:BatchGetItem",
                    "dynamodb:BatchWriteItem",
                ],
            }),
        ],
    });

    stack.addOutputs({
        URL: site.url || "",
    });
}
