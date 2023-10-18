import { HostedZone } from "aws-cdk-lib/aws-route53";
import { StackContext } from "sst/constructs";
import { getDomain } from "@create-disruptions-data/shared-ts/utils/domain";

export const DnsStack = ({ stack }: StackContext) => {
    const hostedZone = HostedZone.fromLookup(stack, "cdd-hosted-zone", {
        domainName: getDomain(stack.stage, true),
    });

    return {
        hostedZone,
    };
};
