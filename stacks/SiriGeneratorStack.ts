import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { EventType, Bucket as S3Bucket } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Bucket, StackContext, use, Function } from "sst/constructs";
import { SiteStack } from "./Site";

export function SiriGeneratorStack({ stack }: StackContext) {
    const { disruptionsJsonBucket } = use(SiteStack);

    const siriSXBucket = new Bucket(stack, "SiriSXBucket", {
        name: `cdd-siri-sx-${stack.stage}`,
    });

    const siriSXUnvalidatedBucket = new Bucket(stack, "SiriSXUnvalidatedBucket", {
        name: `cdd-siri-sx-unvalidated-${stack.stage}`,
    });

    const siriGenerator = new Function(stack, "cdd-siri-generator", {
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

    const siriValidator = new Function(stack, "cdd-siri-sx-validator", {
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

    const bucket = S3Bucket.fromBucketName(stack, "cdd-siri-generator-bucket", disruptionsJsonBucket.bucketName);
    bucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriGenerator));

    const validatorBucket = S3Bucket.fromBucketName(
        stack,
        "cdd-siri-validator-bucket",
        siriSXUnvalidatedBucket.bucketName,
    );
    validatorBucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriValidator));
}
