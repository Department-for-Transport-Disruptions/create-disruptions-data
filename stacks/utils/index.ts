import { Duration } from "aws-cdk-lib";
import { BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Bucket, Stack } from "sst/constructs";

export const getDomain = (stage: string, internalOnly = false) => {
    const { ROOT_DOMAIN: rootDomain, PROD_DOMAIN: prodDomain } = process.env;

    if (prodDomain && !internalOnly) {
        return prodDomain;
    }

    if (!rootDomain) {
        throw new Error("ROOT_DOMAIN must be set");
    }

    const stageToUse = ["test", "preprod", "prod"].includes(stage) ? stage : "sandbox";

    return `${stageToUse}.cdd.${rootDomain}`;
};

export const isSandbox = (stage: string) => !["test", "preprod", "prod"].includes(stage);

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
