import { StackContext, use } from "sst/constructs";
import { DnsStack } from "./DnsStack";
import { createSiriApi } from "./services/APIGateway";
import { SiriGeneratorStack } from "./SiriGeneratorStack";

export function SiriAPIStack({ stack }: StackContext) {
    const { siriSXBucket } = use(SiriGeneratorStack);
    const { hostedZone } = use(DnsStack);

    createSiriApi(stack, siriSXBucket, hostedZone);
}
