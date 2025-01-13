import { Duration } from "aws-cdk-lib";
import { BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Bucket, Stack } from "sst/constructs";

export const createBucket = (stack: Stack, name: string, versioned: boolean, expirationInDays?: number): Bucket => {
    const siriSXBucket = new Bucket(stack, name, {
        name: `${name}-${stack.stage}`,
        cdk: {
            bucket: {
                encryption: BucketEncryption.S3_MANAGED,
                versioned,
                blockPublicAccess: {
                    blockPublicAcls: true,
                    blockPublicPolicy: true,
                    ignorePublicAcls: true,
                    restrictPublicBuckets: true,
                },
                ...(expirationInDays ? { lifecycleRules: [{ expiration: Duration.days(expirationInDays) }] } : {}),
            },
        },
    });

    return siriSXBucket;
};

export const isUserEnv = (stage: string) => !["sandbox", "test", "preprod", "prod"].includes(stage);

export const isSharedSandboxEnv = (stage: string) => stage === "sandbox";
