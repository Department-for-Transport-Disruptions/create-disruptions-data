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

    const siriGenerator = new Function(stack, "cdd-siri-generator", {
        environment: {
            SIRI_SX_BUCKET_ARN: siriSXBucket.bucketArn,
            SIRI_SX_BUCKET_NAME: siriSXBucket.bucketName,
        },
        permissions: [
            new PolicyStatement({
                actions: ["s3:GetObject"],
                resources: [`${disruptionsJsonBucket.bucketArn}/*`],
            }),
            new PolicyStatement({
                actions: ["s3:PutObject"],
                resources: [`${siriSXBucket.bucketArn}/*`],
            }),
        ],
        handler: "packages/siri-sx-generator/index.main",
        timeout: 60,
        memorySize: 256,
    });
    const bucket = S3Bucket.fromBucketName(stack, "cdd-siri-generator-bucket", disruptionsJsonBucket.bucketName);
    bucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriGenerator));
}
