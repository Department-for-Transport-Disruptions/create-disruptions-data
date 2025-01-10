import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";
import { Function, StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { RdsStack } from "./RdsStack";
import { VpcStack } from "./VpcStack";

export const DynamoMigratorStack = ({ stack }: StackContext) => {
    const { disruptionsTable, templateDisruptionsTable } = use(DynamoDBStack);
    const { dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostSecret, dbPortSecret } = use(RdsStack);
    const { vpc, lambdaSg } = use(VpcStack);

    new Function(stack, "cdd-dynamo-disruption-bulk-migrator", {
        functionName: `cdd-dynamo-disruption-bulk-migrator-${stack.stage}`,
        bind: [
            dbUsernameSecret,
            dbPasswordSecret,
            dbNameSecret,
            dbHostSecret,
            dbPortSecret,
            disruptionsTable,
            templateDisruptionsTable,
        ],
        permissions: [
            new PolicyStatement({
                resources: [
                    disruptionsTable.tableArn,
                    templateDisruptionsTable.tableArn,
                    "arn:aws:dynamodb:eu-west-2:899289342948:table/disruptions-prod-copy",
                    "arn:aws:dynamodb:eu-west-2:899289342948:table/disruption-templates-prod-copy",
                ],
                actions: ["dynamodb:Scan"],
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
        handler: "packages/dynamo-disruption-migrator/index.bulkMigrator",
        timeout: 600,
        memorySize: 3072,
        runtime: "nodejs20.x",
        environment: {
            DISRUPTIONS_TABLE: "disruptions-prod-copy",
            DISRUPTION_TEMPLATES_TABLE: "disruption-templates-prod-copy",
        },
    });

    const incrementalMigrator = new Function(stack, "cdd-dynamo-disruption-incremental-migrator", {
        functionName: `cdd-dynamo-disruption-incremental-migrator-${stack.stage}`,
        bind: [
            dbUsernameSecret,
            dbPasswordSecret,
            dbNameSecret,
            dbHostSecret,
            dbPortSecret,
            disruptionsTable,
            templateDisruptionsTable,
        ],
        permissions: [
            new PolicyStatement({
                resources: [
                    disruptionsTable.tableArn,
                    templateDisruptionsTable.tableArn,
                    "arn:aws:dynamodb:eu-west-2:899289342948:table/disruptions-prod-copy",
                    "arn:aws:dynamodb:eu-west-2:899289342948:table/disruption-templates-prod-copy",
                ],
                actions: ["dynamodb:Query"],
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
        handler: "packages/dynamo-disruption-migrator/index.incrementalMigrator",
        timeout: 600,
        memorySize: 3072,
        runtime: "nodejs20.x",
    });

    incrementalMigrator.addEventSourceMapping("prod-copy-stream-event", {
        eventSourceArn: `arn:aws:dynamodb:eu-west-2:${stack.account}:table/disruptions-prod-copy/stream/2025-01-10T14:50:37.984`,
        batchSize: 1,
        startingPosition: StartingPosition.LATEST,
        retryAttempts: 3,
    });

    incrementalMigrator.addToRolePolicy(
        new PolicyStatement({
            actions: [
                "dynamodb:DescribeStream",
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:ListStreams",
            ],
            resources: [
                `arn:aws:dynamodb:eu-west-2:${stack.account}:table/disruptions-prod-copy/stream/2025-01-10T14:50:37.984`,
            ],
        }),
    );

    disruptionsTable.addConsumers(stack, {
        migrator: incrementalMigrator,
    });

    templateDisruptionsTable.addConsumers(stack, {
        migrator: incrementalMigrator,
    });
};
