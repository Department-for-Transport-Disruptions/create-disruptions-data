import { HostedZone } from "aws-cdk-lib/aws-route53";
import { StackContext } from "sst/constructs";

export const DnsStack = ({ stack }: StackContext) => {
    const { ROOT_DOMAIN: rootDomain } = process.env;

    if (!rootDomain) {
        throw new Error("ROOT_DOMAIN must be set");
    }

    const stage = ["test", "preprod", "prod"].includes(stack.stage) ? stack.stage : "sandbox";

    const hostedZone = HostedZone.fromLookup(stack, "cdd-hosted-zone", {
        domainName: `${stage}.cdd.${rootDomain}`,
    });

    return {
        hostedZone,
    };
};
