import { EventType, Bucket as S3Bucket } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Cron, StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { createBucket } from "./services/Buckets";
import { createGeneratorLambda } from "./services/GeneratorLambda";
import { createValidatorLambda } from "./services/ValidatorLambda";

export function SiriGeneratorStack({ stack }: StackContext) {
    const { disruptionsTable, organisationsTableV2 } = use(DynamoDBStack);

    const siriSXBucket = createBucket(stack, "cdd-siri-sx", true);

    const siriSXUnvalidatedBucket = createBucket(stack, "cdd-siri-sx-unvalidated", false, 30);

    const siriGenerator = createGeneratorLambda(stack, siriSXUnvalidatedBucket, disruptionsTable, organisationsTableV2);

    new Cron(stack, "cdd-siri-sx-generator-cron", {
        job: siriGenerator,
        schedule: `rate(${stack.stage === "prod" || stack.stage === "preprod" ? "1 minute" : "5 minutes"})`,
    });

    const siriValidator = createValidatorLambda(stack, siriSXUnvalidatedBucket, siriSXBucket);

    const validatorBucket = S3Bucket.fromBucketName(
        stack,
        "cdd-siri-sx-unvalidated-bucket",
        siriSXUnvalidatedBucket.bucketName,
    );
    validatorBucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriValidator));

    return {
        siriSXBucket,
    };
}
