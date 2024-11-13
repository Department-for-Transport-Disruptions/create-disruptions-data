import { TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Function, StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { MonitoringStack } from "./MonitoringStack";
import { RdsStack } from "./RdsStack";
import { VpcStack } from "./VpcStack";
import { createBucket } from "./utils";

export const OrgDisruptionsGeneratorStack = ({ stack }: StackContext) => {
    const { disruptionsTable } = use(DynamoDBStack);
    const { alarmTopic } = use(MonitoringStack);
    const { dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostROSecret, dbPortSecret } = use(RdsStack);
    const { vpc, lambdaSg } = use(VpcStack);

    const apiUrl = !["preprod", "prod"].includes(stack.stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1"
        : `https://api.${stack.stage}.ref-data.dft-create-data.com/v1`;

    const orgDisruptionsBucket = createBucket(stack, "cdd-org-disruptions", true);

    const orgDisruptionsGeneratorFunction = new Function(stack, "cdd-org-disruptions-generator-function", {
        functionName: `cdd-org-disruptions-generator-${stack.stage}`,
        bind: [dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostROSecret, dbPortSecret],
        environment: {
            DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
            ORG_DISRUPTIONS_BUCKET_NAME: orgDisruptionsBucket.bucketName,
            API_BASE_URL: apiUrl,
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
        vpc,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        securityGroups: [lambdaSg],
        nodejs: {
            install: ["pg", "kysely"],
        },
        handler: "packages/org-disruptions-generator/index.main",
        timeout: 300,
        memorySize: 1024,
        runtime: "nodejs20.x",
    });

    disruptionsTable.addConsumers(stack, {
        consumer: orgDisruptionsGeneratorFunction,
    });

    orgDisruptionsGeneratorFunction
        .metric("Errors")
        .createAlarm(stack, "cdd-org-disruptions-generator-failure-alarm", {
            evaluationPeriods: 1,
            threshold: 1,
            treatMissingData: TreatMissingData.NOT_BREACHING,
            alarmName: `cdd-org-disruptions-generator-failure-alarm-${stack.stage}`,
        })
        .addAlarmAction(new SnsAction(alarmTopic));

    return {
        orgDisruptionsBucket,
    };
};
