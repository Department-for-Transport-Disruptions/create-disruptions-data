import { HostedZone, PrivateHostedZone } from "aws-cdk-lib/aws-route53";
import { StackContext, use } from "sst/constructs";
import { getDomain } from "../shared-ts/utils/domain";
import { VpcStack } from "./VpcStack";
import { isUserEnv } from "./utils";

export const DnsStack = ({ stack }: StackContext) => {
    const { vpc } = use(VpcStack);

    const hostedZone = HostedZone.fromLookup(stack, "cdd-hosted-zone", {
        domainName: getDomain(stack.stage, true),
    });

    const privateHostedZone = isUserEnv(stack.stage)
        ? PrivateHostedZone.fromLookup(stack, "cdd-private-hosted-zone", {
              domainName: "cdd.internal",
              vpcId: vpc.vpcId,
              privateZone: true,
          })
        : new PrivateHostedZone(stack, "cdd-private-hosted-zone", {
              vpc,
              zoneName: "cdd.internal",
          });

    return {
        hostedZone,
        privateHostedZone,
    };
};
