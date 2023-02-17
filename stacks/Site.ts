import { Bucket, NextjsSite, StackContext } from "sst/constructs";

export function SiteStack({ stack }: StackContext) {
    const disruptionsJsonBucket = new Bucket(stack, "DisruptionsJsonBucket", {
        name: `cdd-disruptions-json-${stack.stage}`,
    });

    const siriSXBucket = new Bucket(stack, "SiriSXBucket", {
        name: `cdd-siri-sx-${stack.stage}`,
    });

    const site = new NextjsSite(stack, "Site", {
        path: "site/",
        environment: {
            DISRUPTIONS_JSON_BUCKET_ARN: disruptionsJsonBucket.bucketArn,
            SIRI_SX_BUCKET_ARN: siriSXBucket.bucketArn,
        },
    });

    stack.addOutputs({
        URL: site.url || "",
    });

    return {
        disruptionsJsonBucket,
        siriSXBucket,
    };
}

