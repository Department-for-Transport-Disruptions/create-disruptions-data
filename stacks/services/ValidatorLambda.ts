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
                actions: ["s3:GetObject"],
                resources: [`${siriSXUnvalidatedBucket.bucketArn}/*`],
            }),
            new PolicyStatement({
                actions: ["s3:PutObject"],
                resources: [`${siriSXBucket.bucketArn}/*`],
            }),
        ],
        handler: "packages/siri-sx-validator/index.main",
        timeout: 600,
        memorySize: 256,
        runtime: "python3.9",
        python: {
            installCommands: [
                "pip install -r packages/siri-sx-validator/requirements.txt --target packages/siri-sx-validator/",
            ],
        },
        enableLiveDev: false,
    });

    return siriValidator;
};
