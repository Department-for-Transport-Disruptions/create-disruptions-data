import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, Stack, Function, Table } from "sst/constructs";

export const createGeneratorLambda = (stack: Stack, siriSXUnvalidatedBucket: Bucket, table: Table) => {
    const siriGenerator = new Function(stack, "cdd-siri-sx-generator", {
        functionName: `cdd-siri-sx-generator-${stack.stage}`,
        environment: {
            TABLE_NAME: table.tableName,
            SIRI_SX_UNVALIDATED_BUCKET_NAME: siriSXUnvalidatedBucket.bucketName,
        },
        permissions: [
            new PolicyStatement({
                resources: [`${siriSXUnvalidatedBucket.bucketArn}/*`],
                actions: ["s3:PutObject"],
            }),
            new PolicyStatement({
                resources: [table.tableArn],
                actions: ["dynamodb:Scan"],
            }),
            new PolicyStatement({
                resources: [`${table.tableArn}/stream/*`],
                actions: [
                    "dynamodb:GetRecords",
                    "dynamodb:DescribeStream",
                    "dynamodb:GetShardIterator",
                    "dynamodb:ListStreams",
                ],
            }),
        ],
        handler: "packages/siri-sx-generator/index.main",
        timeout: 60,
        memorySize: 256,
    });

    return siriGenerator;
};
