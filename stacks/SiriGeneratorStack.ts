import { EventType, Bucket as S3Bucket } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { StackContext, use } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { createBucket } from "./services/Buckets";
import { createGeneratorLambda } from "./services/GeneratorLambda";
import { createValidatorLambda } from "./services/ValidatorLambda";

export function SiriGeneratorStack({ stack }: StackContext) {
    const { disruptionsTable, organisationsTable } = use(DynamoDBStack);

    const siriSXBucket = createBucket(stack, "cdd-siri-sx", true);

    const siriSXUnvalidatedBucket = createBucket(stack, "cdd-siri-sx-unvalidated", true);

    const siriGenerator = createGeneratorLambda(stack, siriSXUnvalidatedBucket, disruptionsTable, organisationsTable);

    disruptionsTable.addConsumers(stack, {
        siriGenerator: siriGenerator,
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
