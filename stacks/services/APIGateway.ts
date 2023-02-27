import {
    AuthorizationType,
    AwsIntegration,
    MethodOptions,
    PassthroughBehavior,
    Resource,
} from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { ApiGatewayV1Api, Stack, Bucket } from "sst/constructs";
import { SiriGeneratorStack } from "../SiriGeneratorStack";

export const createSiriApi = (stack: Stack, siriSXBucket: Bucket): void => {
    const apiGateway = new ApiGatewayV1Api(stack, "SiriSXApi", {
        cdk: {
            restApi: {
                restApiName: `SiriSXApi-${stack.stage}`,
                description: "API to retrieve Siri SX XML data",
            },
        },
    });

    const bucketResource: Resource = apiGateway.cdk.restApi.root.addResource("{folder}");
    const objectResource: Resource = bucketResource.addResource("{item}");
    // apiGateway.cdk.restApi.root.addResource("{folder}").addMethod("GET", new AwsIntegration({service:'s3'}), {});

    const executeRole = new Role(stack, "siri-sx-api-gateway-s3-assume-role", {
        assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
        roleName: `Siri-SX-API-Gateway-S3-Integration-Role-${stack.stage}`,
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
};
