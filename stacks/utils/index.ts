import { BucketEncryption, LifecycleRule } from "aws-cdk-lib/aws-s3";
import { Bucket, Stack } from "sst/constructs";

export const createBucket = (
    stack: Stack,
    name: string,
    versioned: boolean,
    lifecycleRules?: LifecycleRule[],
): Bucket => {
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
                lifecycleRules,
            },
        },
    });

    return siriSXBucket;
};

export const isUserEnv = (stage: string) => !["sandbox", "test", "preprod", "prod"].includes(stage);

export const isSharedSandboxEnv = (stage: string) => stage === "sandbox";

export const getRefDataApiUrl = (stage: string) => {
    const oldRefDataApiUrl = !["preprod", "prod"].includes(stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1"
        : `https://api.${stage}.ref-data.dft-create-data.com/v1`;

    const disruptionsRefDataApiUrl = !["test", "preprod", "prod"].includes(stage)
        ? `https://ref-data-api.${stage}.sandbox.cdd.dft-create-data.com/v1`
        : `https://ref-data-api.${stage}.cdd.dft-create-data.com/v1`;

    return ["prod"].includes(stage) ? oldRefDataApiUrl : disruptionsRefDataApiUrl;
};
