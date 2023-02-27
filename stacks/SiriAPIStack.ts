import { StackContext, use } from "sst/constructs";
import { createSiriApi } from "./services/APIGateway";
import { createBucket } from "./services/GeneratorBucket";

export function SiriAPIStack({ stack }: StackContext) {
  const siriSXBucket = createBucket(stack, "cdd-siri-sx", true);

    createSiriApi(stack, siriSXBucket);

    return {
      siriSXBucket
    }
}
