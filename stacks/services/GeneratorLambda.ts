import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, Stack, Function } from "sst/constructs";

export const createGeneratorLambda = (stack: Stack, siriSXUnvalidatedBucket: Bucket, disruptionsJsonBucket: Bucket) => {
    const siriGenerator = new Function(stack, "cdd-siri-sx-generator", {
        functionName: `cdd-siri-sx-generator-${stack.stage}`,
        environment: {
            SIRI_SX_UNVALIDATED_BUCKET_NAME: siriSXUnvalidatedBucket.bucketName,
        },
        permissions: [
            new PolicyStatement({
                actions: ["s3:GetObject"],
                resources: [`${disruptionsJsonBucket.bucketArn}/*`],
            }),
            new PolicyStatement({
                actions: ["s3:PutObject"],
                resources: [`${siriSXUnvalidatedBucket.bucketArn}/*`],
            }),
        ],
        handler: "packages/siri-sx-generator/index.main",
        timeout: 60,
        memorySize: 256,
    });

    return siriGenerator;
};
