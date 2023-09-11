import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Stack, Function, Table } from "sst/constructs";

export const createStatsGeneratorLambda = (stack: Stack, disruptionsTable: Table, organisationsTable: Table) => {
    const siriStatsGenerator = new Function(stack, "cdd-siri-stats-generator", {
        functionName: `cdd-siri-stats-generator-${stack.stage}`,
        environment: {
            DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
            ORGANISATIONS_TABLE_NAME: organisationsTable.tableName,
        },
        permissions: [
            new PolicyStatement({
                resources: [disruptionsTable.tableArn],
                actions: ["dynamodb:Scan"],
            }),
            new PolicyStatement({
                resources: [organisationsTable.tableArn],
                actions: ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:GetItem"],
            }),
        ],
        handler: "packages/siri-sx-stats-generator/index.main",
        timeout: 60,
        memorySize: 256,
    });

    return siriStatsGenerator;
};
