import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Function, StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { RdsStack } from "./RdsStack";
import { VpcStack } from "./VpcStack";

export const DynamoMigratorStack = ({ stack }: StackContext) => {
    const { disruptionsTable, templateDisruptionsTable } = use(DynamoDBStack);
    const { dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostROSecret, dbPortSecret } = use(RdsStack);
    const { vpc, lambdaSg } = use(VpcStack);

    new Function(stack, "cdd-dynamo-migrator", {
        functionName: `cdd-dynamo-migrator-${stack.stage}`,
        bind: [dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostROSecret, dbPortSecret],
        permissions: [
            new PolicyStatement({
                resources: [
                    disruptionsTable.tableArn,
                    templateDisruptionsTable.tableArn,
                    "arn:aws:dynamodb:eu-west-2:899289342948:table/disruptions-prod-copy",
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
        handler: "packages/dynamo-disruption-migrator/index.main",
        timeout: 600,
        memorySize: 3072,
        runtime: "nodejs20.x",
    });
};
