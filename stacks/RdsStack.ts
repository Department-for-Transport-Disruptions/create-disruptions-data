import { Tags } from "aws-cdk-lib";
import { BastionHostLinux, BlockDeviceVolume, SubnetType } from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { CnameRecord } from "aws-cdk-lib/aws-route53";
import { Config, Function, StackContext, use } from "sst/constructs";
import { DnsStack } from "./DnsStack";
import { VpcStack } from "./VpcStack";
import { isUserEnv } from "./utils";

export const RdsStack = ({ stack }: StackContext) => {
    const { vpc, dbSg, bastionSg, lambdaSg } = use(VpcStack);
    const { privateHostedZone } = use(DnsStack);

    const dbUsernameSecret = new Config.Secret(stack, "DB_USERNAME");
    const dbPasswordSecret = new Config.Secret(stack, "DB_PASSWORD");
    const dbHostSecret = new Config.Secret(stack, "DB_HOST");
    const dbPortSecret = new Config.Secret(stack, "DB_PORT");
    const dbNameSecret = new Config.Secret(stack, "DB_NAME");

    new Function(stack, "cdd-kysely-db-migrator-migrate-function", {
        bind: [dbUsernameSecret, dbPasswordSecret, dbHostSecret, dbPortSecret, dbNameSecret],
        functionName: `cdd-kysely-db-migrator-migrate-${stack.stage}`,
        vpc,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        securityGroups: [lambdaSg],
        handler: "packages/db-migrator/index.main",
        timeout: 300,
        memorySize: 512,
        runtime: "nodejs20.x",
        architecture: "arm_64",
        enableLiveDev: false,
        nodejs: {
            install: ["pg", "kysely"],
        },
        copyFiles: [
            {
                from: "./shared-ts/db/migrations",
                to: "./packages/db-migrator/migrations",
            },
        ],
    });

    new Function(stack, "cdd-kysely-db-migrator-rollback-function", {
        bind: [dbUsernameSecret, dbPasswordSecret, dbHostSecret, dbPortSecret, dbNameSecret],
        functionName: `cdd-kysely-db-migrator-rollback-${stack.stage}`,
        vpc,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        securityGroups: [lambdaSg],
        handler: "packages/db-migrator/index.main",
        timeout: 300,
        memorySize: 512,
        runtime: "nodejs20.x",
        architecture: "arm_64",
        enableLiveDev: false,
        nodejs: {
            install: ["pg", "kysely"],
        },
        environment: {
            ROLLBACK: "true",
        },
        copyFiles: [
            {
                from: "./shared-ts/db/migrations",
                to: "./packages/db-migrator/migrations",
            },
        ],
    });

    if (isUserEnv(stack.stage)) {
        new Function(stack, "cdd-local-database-creator-function", {
            bind: [dbUsernameSecret, dbPasswordSecret, dbHostSecret, dbPortSecret, dbNameSecret],
            functionName: `cdd-local-database-creator-${stack.stage}`,
            vpc,
            vpcSubnets: {
                subnetType: SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [lambdaSg],
            handler: "packages/local-db-creator/index.main",
            timeout: 300,
            memorySize: 512,
            runtime: "nodejs20.x",
            architecture: "arm_64",
            enableLiveDev: false,
            nodejs: {
                install: ["pg", "kysely"],
            },
        });
    } else {
        const cluster = new rds.DatabaseCluster(stack, "cdd-rds-db-cluster", {
            clusterIdentifier: `cdd-rds-db-cluster-${stack.stage}`,
            engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_16_4 }),
            writer: rds.ClusterInstance.serverlessV2("cdd-rds-instance-1", {
                publiclyAccessible: false,
            }),
            readers: stack.stage === "prod" ? [rds.ClusterInstance.serverlessV2("cdd-rds-instance-2")] : [],
            serverlessV2MinCapacity: stack.stage === "prod" ? 1 : 0.5,
            serverlessV2MaxCapacity: stack.stage === "prod" ? 2 : 1,
            vpcSubnets: {
                subnetType: SubnetType.PRIVATE_ISOLATED,
            },
            securityGroups: [dbSg],
            vpc,
            defaultDatabaseName: "disruptions",
        });

        const cfnCluster = cluster.node.defaultChild as rds.CfnDBCluster;

        cfnCluster.masterUserPassword = undefined;
        cfnCluster.manageMasterUserPassword = true;

        new CnameRecord(stack, "cdd-rds-internal-domain", {
            recordName: `db.${privateHostedZone.zoneName}`,
            zone: privateHostedZone,
            domainName: cluster.clusterEndpoint.hostname,
        });

        new CnameRecord(stack, "cdd-rds-read-internal-domain", {
            recordName: `db-ro.${privateHostedZone.zoneName}`,
            zone: privateHostedZone,
            domainName: cluster.clusterReadEndpoint.hostname,
        });

        const bastionHost = new BastionHostLinux(stack, "cdd-rds-bastion-host", {
            vpc,
            blockDevices: [
                {
                    deviceName: "/dev/sdh",
                    volume: BlockDeviceVolume.ebs(10, {
                        encrypted: true,
                    }),
                },
            ],
            instanceName: `cdd-rds-bastion-host-${stack.stage}`,
            subnetSelection: {
                subnetType: SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroup: bastionSg,
        });

        Tags.of(bastionHost.instance).add("Bastion", "true");
    }

    return { dbUsernameSecret, dbPasswordSecret, dbHostSecret, dbPortSecret, dbNameSecret };
};
