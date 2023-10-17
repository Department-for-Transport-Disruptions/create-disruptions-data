import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { EventType, Bucket as S3Bucket } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Config, Cron, Function, StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { createBucket } from "./utils";

export function SiriGeneratorStack({ stack }: StackContext) {
    const {
        disruptionsTable,
        organisationsTableV2: organisationsTable,
        disruptionsTableNameParam,
        orgTableNameParam,
    } = use(DynamoDBStack);

    const siriSXBucket = createBucket(stack, "cdd-siri-sx", true);

    const siriSXUnvalidatedBucket = createBucket(stack, "cdd-siri-sx-unvalidated", false, 30);
    const disruptionsJsonBucket = createBucket(stack, "cdd-disruptions-json", true);
    const disruptionsCsvBucket = createBucket(stack, "cdd-disruptions-csv", true);

    const unvalidatedSiriBucketNameParam = new Config.Parameter(stack, "SIRI_SX_UNVALIDATED_BUCKET_NAME", {
        value: siriSXUnvalidatedBucket.bucketName,
    });

    const disruptionsJsonBucketNameParam = new Config.Parameter(stack, "DISRUPTIONS_JSON_BUCKET_NAME", {
        value: disruptionsJsonBucket.bucketName,
    });

    const disruptionsCsvBucketNameParam = new Config.Parameter(stack, "DISRUPTIONS_CSV_BUCKET_NAME", {
        value: disruptionsCsvBucket.bucketName,
    });

    const siriGenerator = new Function(stack, "cdd-siri-sx-generator", {
        functionName: `cdd-siri-sx-generator-${stack.stage}`,
        bind: [
            disruptionsTableNameParam,
            orgTableNameParam,
            unvalidatedSiriBucketNameParam,
            disruptionsJsonBucketNameParam,
            disruptionsCsvBucketNameParam,
        ],
        permissions: [
            new PolicyStatement({
                resources: [
                    `${siriSXUnvalidatedBucket.bucketArn}/*`,
                    `${disruptionsJsonBucket.bucketArn}/*`,
                    `${disruptionsCsvBucket.bucketArn}/*`,
                ],
                actions: ["s3:PutObject"],
            }),
            new PolicyStatement({
                resources: [disruptionsTable.tableArn],
                actions: ["dynamodb:Scan"],
            }),
            new PolicyStatement({
                resources: [organisationsTable.tableArn],
                actions: ["dynamodb:GetItem"],
            }),
        ],
        handler: "packages/siri-sx-generator/index.main",
        timeout: 60,
        memorySize: 1536,
        runtime: "nodejs18.x",
    });

    new Cron(stack, "cdd-siri-sx-generator-cron", {
        job: siriGenerator,
        schedule: `rate(${stack.stage === "prod" || stack.stage === "preprod" ? "1 minute" : "5 minutes"})`,
    });

    const siriStatsGenerator = new Function(stack, "cdd-siri-stats-generator", {
        functionName: `cdd-siri-stats-generator-${stack.stage}`,
        bind: [disruptionsTableNameParam, orgTableNameParam],
        permissions: [
            new PolicyStatement({
                resources: [disruptionsTable.tableArn],
                actions: ["dynamodb:Scan"],
            }),
            new PolicyStatement({
                resources: [organisationsTable.tableArn],
                actions: ["dynamodb:Scan", "dynamodb:TransactWriteItem", "dynamodb:PutItem"],
            }),
        ],
        handler: "packages/siri-sx-stats-generator/index.main",
        timeout: 60,
        memorySize: 1536,
    });

    new Cron(stack, "cdd-siri-stats-generator-cron", {
        job: siriStatsGenerator,
        schedule: `rate(${stack.stage === "prod" || stack.stage === "preprod" ? "1 minute" : "5 minutes"})`,
    });

    const siriValidator = new Function(stack, "cdd-siri-sx-validator", {
        functionName: `cdd-siri-sx-validator-${stack.stage}`,
        environment: {
            SIRI_SX_BUCKET_NAME: siriSXBucket.bucketName,
            SIRI_SX_UNVALIDATED_BUCKET_NAME: siriSXUnvalidatedBucket.bucketName,
        },
        permissions: [
            new PolicyStatement({
                resources: [`${siriSXUnvalidatedBucket.bucketArn}/*`],
                actions: ["s3:GetObject"],
            }),

            new PolicyStatement({
                resources: [`${siriSXBucket.bucketArn}/*`],
                actions: ["s3:PutObject"],
            }),
        ],
        handler: "packages/siri-sx-validator/index.main",
        timeout: 60,
        memorySize: 1536,
        runtime: "python3.11",
        enableLiveDev: false,
    });

    const validatorBucket = S3Bucket.fromBucketName(
        stack,
        "cdd-siri-sx-unvalidated-bucket",
        siriSXUnvalidatedBucket.bucketName,
    );

    validatorBucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriValidator));

    return {
        siriSXBucket,
        disruptionsJsonBucket,
        disruptionsCsvBucket,
        unvalidatedSiriBucketNameParam,
        disruptionsJsonBucketNameParam,
        disruptionsCsvBucketNameParam,
    };
}
