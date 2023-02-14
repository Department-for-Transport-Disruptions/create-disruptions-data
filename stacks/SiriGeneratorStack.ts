import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Function, StackContext, use } from "sst/constructs";
import { SiteStack } from "./Site";

export function SiriGeneratorStack({ stack }: StackContext) {
    const { disruptionsJsonBucket } = use(SiteStack);

    disruptionsJsonBucket.addNotifications(stack, {
        triggerSiriGenerator: {
            function: {
                handler: "packages/siri-sx-generator/index.main",
                timeout: 10,
                memorySize: 256,
            },
            events: ["object_created"],
        },
    });
}
