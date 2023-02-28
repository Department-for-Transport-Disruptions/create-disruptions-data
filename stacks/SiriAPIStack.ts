import { StackContext, use } from "sst/constructs";
import { createSiriApi } from "./services/APIGateway";
import { SiriGeneratorStack } from "./SiriGeneratorStack";

export function SiriAPIStack({ stack }: StackContext) {
    const { siriSXBucket } = use(SiriGeneratorStack);

    createSiriApi(stack, siriSXBucket);
}
