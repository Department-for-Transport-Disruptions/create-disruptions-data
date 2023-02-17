import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { EventType, Bucket } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { StackContext, use, Function } from "sst/constructs";
import { SiteStack } from "./Site";

export function SiriGeneratorStack({ stack }: StackContext) {
    const { disruptionsJsonBucket,siriSXBucket } = use(SiteStack);
    const siriGenerator = new Function(stack, "cdd-siri-generator", {
        permissions: [
            new PolicyStatement({
                actions: ["s3:GetObject"],
                resources: [`${disruptionsJsonBucket.bucketArn}/*`],
            }),
            new PolicyStatement({
                actions: ["s3:PutObject"],
                resources: [`${siriSXBucket.bucketArn}/*`],
            })
        ],
        handler: "packages/siri-sx-generator/index.main",
        timeout: 60,
        memorySize: 256,
    });
    const bucket = Bucket.fromBucketName(stack, "cdd-siri-generator-bucket", disruptionsJsonBucket.bucketName);
    bucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriGenerator));
}
