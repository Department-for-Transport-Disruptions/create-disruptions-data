import { EventType, Bucket as S3Bucket } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { StackContext, use } from "sst/constructs";
import { SiteStack } from "./Site";

import { createSiriApi } from "./services/APIGateway";
import { createBucket } from "./services/GeneratorBucket";
import { createUnvalidatedBucket } from "./services/UnvalidatedBucket";
import { createGeneratorLambda } from "./services/GeneratorLambda";
import { createValidatorLambda } from "./services/ValidatorLambda";

export function SiriGeneratorStack({ stack }: StackContext) {
    const { disruptionsJsonBucket } = use(SiteStack);

    const siriSXBucket = createBucket(stack, "cdd-siri-sx", true);

    const siriSXUnvalidatedBucket = createUnvalidatedBucket(stack);

    const siriGenerator = createGeneratorLambda(stack, siriSXUnvalidatedBucket, disruptionsJsonBucket);

    const siriValidator = createValidatorLambda(stack, siriSXUnvalidatedBucket, siriSXBucket);

    const bucket = S3Bucket.fromBucketName(stack, "cdd-siri-sx-bucket", disruptionsJsonBucket.bucketName);
    bucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriGenerator));

    const validatorBucket = S3Bucket.fromBucketName(
        stack,
        "cdd-siri-sx-unvalidated-bucket",
        siriSXUnvalidatedBucket.bucketName,
    );
    validatorBucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriValidator));

    createSiriApi(stack, siriSXBucket);

    return {
        siriSXBucket,
    };
}
