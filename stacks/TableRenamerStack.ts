import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { Schedule } from "aws-cdk-lib/aws-events";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Cron, Function, StackContext, use } from "sst/constructs";

import { RdsStack } from "./RdsStack";
import { VpcStack } from "./VpcStack";

export function TableRenamerStack({ stack }: StackContext) {
    const { dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostSecret, dbPortSecret } = use(RdsStack);
    const { vpc, lambdaSg } = use(VpcStack);
    const defaultDaySchedule = stack.stage === "prod" ? "*" : stack.stage === "preprod" ? "*/2" : "*/4";

    const enableSchedule = stack.stage === "prod" || stack.stage === "preprod" || stack.stage === "test";

    const tableRenamer = new Function(stack, "ref-data-service-table-renamer", {
        bind: [dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostSecret, dbPortSecret],
        functionName: `ref-data-service-table-renamer-${stack.stage}`,
        handler: "packages/table-renamer/index.main",
        vpc,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        securityGroups: [lambdaSg],
        runtime: "nodejs20.x",
        timeout: 600,
        memorySize: 256,
        environment: {
            STAGE: stack.stage,
        },
        logRetention: stack.stage === "prod" ? "one_month" : "two_weeks",
        permissions: [
            new PolicyStatement({
                actions: ["ssm:PutParameter", "ssm:GetParameter"],
                resources: ["*"],
            }),
        ],
        enableLiveDev: false,
    });

    new Cron(stack, "ref-data-service-table-renamer-cron", {
        job: tableRenamer,
        enabled: enableSchedule,
        cdk: {
            rule: {
                schedule: Schedule.cron({ minute: "00", hour: "6", day: defaultDaySchedule }),
            },
        },
    });
}
