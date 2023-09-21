import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, Stack, Function } from "sst/constructs";

export const createValidatorLambda = (stack: Stack, siriSXUnvalidatedBucket: Bucket, siriSXBucket: Bucket) => {
    const siriValidator = new Function(stack, "cdd-siri-sx-validator", {
        functionName: `cdd-siri-sx-validator-${stack.stage}`,
        environment: {
            SIRI_SX_BUCKET_NAME: siriSXBucket.bucketName,
            SIRI_SX_UNVALIDATED_BUCKET_NAME: siriSXUnvalidatedBucket.bucketName,
        },
        permissions: [
            new PolicyStatement({
                resources: [`${siriSXUnvalidatedBucket.bucketArn}/*`],
                actions: ["s3:GetObject"],
            }),

            new PolicyStatement({
                resources: [`${siriSXBucket.bucketArn}/*`],
                actions: ["s3:PutObject"],
            }),
        ],
        handler: "packages/siri-sx-validator/index.main",
        timeout: 60,
        memorySize: 1536,
        runtime: "python3.11",
        enableLiveDev: false,
    });

    return siriValidator;
};
