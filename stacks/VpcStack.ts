import { CfnSecurityGroupIngress, Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { StackContext } from "sst/constructs";
import { isUserEnv } from "./utils";

export const VpcStack = ({ stack }: StackContext) => {
    const vpc = isUserEnv(stack.stage)
        ? Vpc.fromLookup(stack, "cdd-vpc-sandbox", {
              vpcName: "cdd-vpc-sandbox",
          })
        : new Vpc(stack, "cdd-vpc", {
              natGateways: 1,
              restrictDefaultSecurityGroup: true,
              vpcName: `cdd-vpc-${stack.stage}`,
              enableDnsHostnames: true,
              enableDnsSupport: true,
              subnetConfiguration: [
                  {
                      name: "public",
                      subnetType: SubnetType.PUBLIC,
                  },
                  {
                      name: "private",
                      subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                  },
                  {
                      name: "db",
                      subnetType: SubnetType.PRIVATE_ISOLATED,
                  },
              ],
          });

    const siteSg = new SecurityGroup(stack, "cdd-site-sg", {
        vpc,
        allowAllOutbound: true,
        securityGroupName: `cdd-site-sg-${stack.stage}`,
    });

    siteSg.addIngressRule(Peer.prefixList("pl-93a247fa"), Port.HTTPS); // Prefix list ID for CloudFront origin facing requests

    const bastionSg = new SecurityGroup(stack, "cdd-bastion-sg", {
        vpc,
        allowAllOutbound: true,
        securityGroupName: `cdd-bastion-sg-${stack.stage}`,
    });

    const lambdaSg = new SecurityGroup(stack, "cdd-lambda-sg", {
        vpc,
        allowAllOutbound: true,
        securityGroupName: `cdd-lambda-sg-${stack.stage}`,
    });

    const dbSg = new SecurityGroup(stack, "cdd-db-sg", {
        vpc,
        securityGroupName: `cdd-db-sg-${stack.stage}`,
    });

    dbSg.addIngressRule(Peer.securityGroupId(siteSg.securityGroupId), Port.POSTGRES);
    dbSg.addIngressRule(Peer.securityGroupId(bastionSg.securityGroupId), Port.POSTGRES);
    dbSg.addIngressRule(Peer.securityGroupId(lambdaSg.securityGroupId), Port.POSTGRES);

    const dbSgSelfIngress = new CfnSecurityGroupIngress(stack, "rds-self-ingress", {
        ipProtocol: "tcp",
        sourceSecurityGroupId: dbSg.securityGroupId,
        fromPort: 5432,
        toPort: 5432,
        groupId: dbSg.securityGroupId,
    });

    dbSgSelfIngress.node.addDependency(dbSg);

    return {
        vpc,
        siteSg: isUserEnv(stack.stage)
            ? SecurityGroup.fromLookupByName(stack, "cdd-site-sg-sandbox", "cdd-site-sg-sandbox", vpc)
            : siteSg,
        dbSg: isUserEnv(stack.stage)
            ? SecurityGroup.fromLookupByName(stack, "cdd-db-sg-sandbox", "cdd-db-sg-sandbox", vpc)
            : dbSg,
        bastionSg: isUserEnv(stack.stage)
            ? SecurityGroup.fromLookupByName(stack, "cdd-bastion-sg-sandbox", "cdd-bastion-sg-sandbox", vpc)
            : bastionSg,
        lambdaSg: isUserEnv(stack.stage)
            ? SecurityGroup.fromLookupByName(stack, "cdd-lambda-sg-sandbox", "cdd-lambda-sg-sandbox", vpc)
            : lambdaSg,
    };
};
