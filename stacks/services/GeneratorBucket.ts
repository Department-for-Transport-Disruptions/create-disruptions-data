import { BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Bucket, Stack } from "sst/constructs";

export const createGeneratorBucket = (stack: Stack): Bucket => {
    const siriSXBucket = new Bucket(stack, "SiriSXBucket", {
        name: `cdd-siri-sx-${stack.stage}`,
        cdk: {
            bucket: {
                encryption: BucketEncryption.S3_MANAGED,
                versioned: true,
                blockPublicAccess: {
                    blockPublicAcls: true,
                    blockPublicPolicy: true,
                    ignorePublicAcls: true,
                    restrictPublicBuckets: true,
                },
            },
        },
    });

    return siriSXBucket;
};
