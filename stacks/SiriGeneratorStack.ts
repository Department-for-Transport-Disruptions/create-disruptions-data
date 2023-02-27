import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { BucketEncryption, EventType, Bucket as S3Bucket } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Bucket, StackContext, use, Function, ApiGatewayV1Api } from "sst/constructs";
import { SiteStack } from "./Site";
import {
    AuthorizationType,
    AwsIntegration,
    MethodOptions,
    PassthroughBehavior,
    Resource,
} from "aws-cdk-lib/aws-apigateway";

export function SiriGeneratorStack({ stack }: StackContext) {
    const { disruptionsJsonBucket } = use(SiteStack);

    const siriSXBucket = new Bucket(stack, "SiriSXBucket", {
        name: `cdd-siri-sx-${stack.stage}`,
        cdk: {
            bucket: {
                encryption: BucketEncryption.S3_MANAGED,
                versioned: true,
                blockPublicAccess: {
                    blockPublicAcls: true,
                    blockPublicPolicy: true,
                    ignorePublicAcls: true,
                    restrictPublicBuckets: true,
                },
            },
        },
    });

    const siriSXUnvalidatedBucket = new Bucket(stack, "SiriSXUnvalidatedBucket", {
        name: `cdd-siri-sx-unvalidated-${stack.stage}`,
        cdk: {
            bucket: {
                encryption: BucketEncryption.S3_MANAGED,
                blockPublicAccess: {
                    blockPublicAcls: true,
                    blockPublicPolicy: true,
                    ignorePublicAcls: true,
                    restrictPublicBuckets: true,
                },
            },
        },
    });

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

    const bucket = S3Bucket.fromBucketName(stack, "cdd-siri-sx-bucket", disruptionsJsonBucket.bucketName);
    bucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriGenerator));

    const validatorBucket = S3Bucket.fromBucketName(
        stack,
        "cdd-siri-sx-unvalidated-bucket",
        siriSXUnvalidatedBucket.bucketName,
    );
    validatorBucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(siriValidator));

    const apiGateway = new ApiGatewayV1Api(stack, "SiriSXApi", {
        cdk: {
            restApi: {
                restApiName: "SiriSXApi",
                description: "API to retrieve Siri SX XML data",
            },
        },
    });

    const bucketResource: Resource = apiGateway.cdk.restApi.root.addResource("{folder}");
    const objectResource: Resource = bucketResource.addResource("{item}");
    // apiGateway.cdk.restApi.root.addResource("{folder}").addMethod("GET", new AwsIntegration({service:'s3'}), {});

    const executeRole = new Role(stack, "siri-sx-api-gateway-s3-assume-role", {
        assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
        roleName: "Siri-SX-API-Gateway-S3-Integration-Role",
    });

    executeRole.addToPolicy(
        new PolicyStatement({
            resources: [`${siriSXBucket.bucketArn}/*`],
            actions: ["s3:GetObject"],
        }),
    );

    const s3Integration: AwsIntegration = new AwsIntegration({
        service: "s3",
        region: "eu-west-2",
        integrationHttpMethod: "GET",
        path: "{bucket}/{object}",
        options: {
            credentialsRole: executeRole,
            passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
            requestParameters: {
                // Specify the bucket name from the XML bucket we created above
                "integration.request.path.bucket": "method.request.path.folder",
                // Specify the object name using the APIG context requestId
                "integration.request.path.object": "method.request.path.item",
            },
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Content-Type": "integration.response.header.Content-Type",
                    },
                },
            ],
        },
    });

    const s3ObjectMethod: MethodOptions = {
        // Protected by API Key
        authorizationType: AuthorizationType.NONE,
        // Require the API Key on all requests
        apiKeyRequired: true,
        requestParameters: {
            //"method.request.header.Content-Type": true,
            "method.request.path.folder": true,
            "method.request.path.item": true,
        },
        methodResponses: [
            {
                statusCode: "200",
                responseParameters: {
                    "method.response.header.Content-Type": true,
                },
            },
        ],
    };

    objectResource.addMethod("GET", s3Integration, s3ObjectMethod);

    const plan = apiGateway.cdk.restApi.addUsagePlan("UsagePlan", {
        throttle: {
            rateLimit: 50,
            burstLimit: 10,
        },
        apiStages: [{ api: apiGateway.cdk.restApi, stage: apiGateway.cdk.restApi.deploymentStage }],
    });

    const key = apiGateway.cdk.restApi.addApiKey("ApiKey");

    plan.addApiKey(key);
}
