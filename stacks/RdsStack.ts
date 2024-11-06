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

    const dbConnectionStringSecret = new Config.Secret(stack, "DB_CONNECTION_STRING");

    new Function(stack, "cdd-prisma-migrator-function", {
        bind: [dbConnectionStringSecret],
        functionName: `cdd-prisma-migrator-${stack.stage}`,
        vpc,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        environment: {
            PRISMA_CLI_BINARY_TARGETS: "linux-arm64-openssl-3.0.x",
        },
        securityGroups: [lambdaSg],
        handler: "packages/prisma-migrator/index.main",
        timeout: 300,
        memorySize: 512,
        runtime: "nodejs20.x",
        nodejs: {
            install: ["prisma", "@prisma/client", "@prisma/engines"],
        },
        architecture: "arm_64",
        copyFiles: [
            {
                from: "shared-ts/prisma/schema.prisma",
                to: "./schema.prisma",
            },
            {
                from: "shared-ts/prisma/migrations",
                to: "./migrations",
            },
        ],
        enableLiveDev: false,
    });

    if (isUserEnv(stack.stage)) {
        return { dbConnectionStringSecret };
    }

    const cluster = new rds.DatabaseCluster(stack, "cdd-rds-cluster", {
        clusterIdentifier: `cdd-rds-cluster-${stack.stage}`,
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
    });

    const cfnCluster = cluster.node.defaultChild as rds.CfnDBCluster;

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

    return { dbConnectionStringSecret };
};
