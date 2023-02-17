import { Bucket, NextjsSite, StackContext } from "sst/constructs";

export function SiteStack({ stack }: StackContext) {
    const disruptionsJsonBucket = new Bucket(stack, "DisruptionsJsonBucket", {
        name: `cdd-disruptions-json-${stack.stage}`,
    });

    const site = new NextjsSite(stack, "Site", {
        path: "site/",
        environment: {
            DISRUPTIONS_JSON_BUCKET_ARN: disruptionsJsonBucket.bucketArn,
        },
    });

    stack.addOutputs({
        URL: site.url || "",
    });

    return {
        disruptionsJsonBucket,
    };
}

