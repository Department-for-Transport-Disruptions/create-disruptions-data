import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { EventType, Bucket as S3Bucket } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Cron, Function, StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { MonitoringStack } from "./MonitoringStack";
import { createBucket } from "./utils";

export const SiriGeneratorStack = ({ stack }: StackContext) => {
    const { disruptionsTable, organisationsTableV2: organisationsTable } = use(DynamoDBStack);
    const { siriGeneratorNamespace, siriPublishSuccessMetric, siriValidationFailureMetric } = use(MonitoringStack);

    const siriSXBucket = createBucket(stack, "cdd-siri-sx", true);

    const siriSXUnvalidatedBucket = createBucket(stack, "cdd-siri-sx-unvalidated", false, 30);
    const disruptionsJsonBucket = createBucket(stack, "cdd-disruptions-json", true);
    const disruptionsCsvBucket = createBucket(stack, "cdd-disruptions-csv", true);

    const apiUrl = !["preprod", "prod"].includes(stack.stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1"
        : `https://api.${stack.stage}.ref-data.dft-create-data.com/v1`;

    const siriGenerator = new Function(stack, "cdd-siri-sx-generator", {
        functionName: `cdd-siri-sx-generator-${stack.stage}`,
        environment: {
            DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
            ORGANISATIONS_TABLE_NAME: organisationsTable.tableName,
            SIRI_SX_UNVALIDATED_BUCKET_NAME: siriSXUnvalidatedBucket.bucketName,
            DISRUPTIONS_JSON_BUCKET_NAME: disruptionsJsonBucket.bucketName,
            DISRUPTIONS_CSV_BUCKET_NAME: disruptionsCsvBucket.bucketName,
            STAGE: stack.stage,
            API_BASE_URL: apiUrl,
        },
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
        runtime: "nodejs20.x",
    });

    new Cron(stack, "cdd-siri-sx-generator-cron", {
        job: siriGenerator,
        schedule: `rate(${stack.stage === "prod" || stack.stage === "preprod" ? "1 minute" : "5 minutes"})`,
    });

    const siriStatsGenerator = new Function(stack, "cdd-siri-stats-generator", {
        functionName: `cdd-siri-stats-generator-${stack.stage}`,
        environment: {
            DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
            ORGANISATIONS_TABLE_NAME: organisationsTable.tableName,
            STAGE: stack.stage,
        },
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
        runtime: "nodejs20.x",
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
            METRIC_NAMESPACE: siriGeneratorNamespace,
            VALIDATION_FAILURE_METRIC: siriValidationFailureMetric.metricName,
            SIRI_PUBLISH_METRIC: siriPublishSuccessMetric.metricName,
            STAGE: stack.stage,
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
            new PolicyStatement({
                resources: ["*"],
                actions: ["cloudwatch:PutMetricData"],
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
    };
};
