import { BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Bucket, Stack } from "sst/constructs";

export const createUnvalidatedBucket = (stack: Stack): Bucket => {
    const siriSXUnvalidatedBucket = new Bucket(stack, "SiriSXUnvalidatedBucket", {
        name: `cdd-siri-sx-unvalidated-${stack.stage}`,
        cdk: {
            bucket: {
                encryption: BucketEncryption.S3_MANAGED,
                blockPublicAccess: {
                    blockPublicAcls: true,
                    blockPublicPolicy: true,
                    ignorePublicAcls: true,
                    restrictPublicBuckets: true,
                },
            },
        },
    });

    return siriSXUnvalidatedBucket;
};
