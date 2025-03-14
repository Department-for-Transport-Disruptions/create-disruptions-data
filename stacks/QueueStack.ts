import { Queue, StackContext, use } from "sst/constructs";
import { RdsStack } from "./RdsStack";

export function QueueStack({ stack }: StackContext) {
    const { dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostSecret, dbPortSecret } = use(RdsStack);

    const streetManagerSqsQueue = new Queue(stack, "ref-data-service-street-manager-queue", {
        consumer: {
            function: {
                bind: [dbUsernameSecret, dbPasswordSecret, dbNameSecret, dbHostSecret, dbPortSecret],
                handler: "packages/street-manager-uploader/index.main",
                timeout: 10,
                runtime: "nodejs20.x",
                logRetention: stack.stage === "prod" ? "one_month" : "two_weeks",
            },
            cdk: {
                eventSource: {
                    batchSize: 1,
                },
            },
        },
        cdk: {
            queue: {
                fifo: true,
                contentBasedDeduplication: true,
            },
        },
    });

    return { streetManagerSqsQueue };
}
