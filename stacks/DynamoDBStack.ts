import { BackupPlan, BackupPlanRule, BackupResource, BackupVault } from "aws-cdk-lib/aws-backup";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { StackContext, Table } from "sst/constructs";

export const DynamoDBStack = ({ stack }: StackContext) => {
    const disruptionsTable = new Table(stack, "cdd-dynamodb-disruptions-table", {
        fields: {
            PK: "string",
            SK: "string",
        },
        primaryIndex: {
            partitionKey: "PK",
            sortKey: "SK",
        },
        stream: "keys_only",
        cdk: {
            table: {
                tableName: `cdd-disruptions-table-${stack.stage}`,
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
                deletionProtection: stack.stage === "prod",
            },
        },
    });

    const templateDisruptionsTable = new Table(stack, "cdd-dynamodb-template-disruptions-table", {
        fields: {
            PK: "string",
            SK: "string",
        },
        primaryIndex: {
            partitionKey: "PK",
            sortKey: "SK",
        },
        stream: "keys_only",
        cdk: {
            table: {
                tableName: `cdd-template-disruptions-table-${stack.stage}`,
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
            },
        },
    });

    const organisationsTableV2 = new Table(stack, "cdd-dynamodb-organisations-v2-table", {
        fields: {
            PK: "string",
            SK: "string",
        },
        primaryIndex: {
            partitionKey: "PK",
            sortKey: "SK",
        },
        cdk: {
            table: {
                tableName: `cdd-organisations-v2-table-${stack.stage}`,
                billingMode: BillingMode.PAY_PER_REQUEST,
                pointInTimeRecovery: stack.stage === "prod",
            },
        },
    });

    if (stack.stage === "prod") {
        const backupVault = new BackupVault(stack, "cdd-dynamodb-backup-vault", {
            backupVaultName: `cdd-dynamodb-backup-vault-${stack.stage}`,
        });

        const backupPlan = new BackupPlan(stack, "cdd-dynamodb-backup-plan", {
            backupPlanName: `cdd-dynamodb-backup-plan-${stack.stage}`,
            backupPlanRules: [BackupPlanRule.daily(backupVault), BackupPlanRule.monthly5Year(backupVault)],
        });

        backupPlan.addSelection("cdd-dynamodb-backup-selection", {
            resources: [
                BackupResource.fromArn(disruptionsTable.tableArn),
                BackupResource.fromArn(templateDisruptionsTable.tableArn),
                BackupResource.fromArn(organisationsTableV2.tableArn),
            ],
        });
    }

    return {
        disruptionsTable,
        organisationsTableV2,
        templateDisruptionsTable,
    };
};
