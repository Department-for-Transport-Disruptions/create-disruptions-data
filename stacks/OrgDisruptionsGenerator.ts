import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { StackContext, use, Function } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { createBucket } from "./utils";

export const OrgDisruptionsGeneratorStack = ({ stack }: StackContext) => {
    const { disruptionsTable } = use(DynamoDBStack);

    const orgDisruptionsBucket = createBucket(stack, `cdd-org-disruptions`, true);

    const orgDisruptionsGeneratorFunction = new Function(stack, "cdd-org-disruptions-generator-function", {
        functionName: `cdd-org-disruptions-generator-${stack.stage}`,
        environment: {
            DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
            ORG_DISRUPTIONS_BUCKET_NAME: orgDisruptionsBucket.bucketName,
        },
        permissions: [
            new PolicyStatement({
                resources: [disruptionsTable.tableArn],
                actions: ["dynamodb:Query"],
            }),
            new PolicyStatement({
                resources: [`${orgDisruptionsBucket.bucketArn}/*`],
                actions: ["s3:PutObject"],
            }),
        ],
        handler: "packages/org-disruptions-generator/index.main",
        timeout: 120,
        memorySize: 1024,
        runtime: "nodejs20.x",
    });

    disruptionsTable.addConsumers(stack, {
        consumer: orgDisruptionsGeneratorFunction,
    });

    return {
        orgDisruptionsBucket,
    };
};
