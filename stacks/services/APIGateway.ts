import {
    AuthorizationType,
    AwsIntegration,
    MethodOptions,
    PassthroughBehavior,
    Resource,
} from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { ApiGatewayV1Api, Stack, Bucket } from "sst/constructs";

export const createSiriApi = (stack: Stack, siriSXBucket: Bucket): void => {
    const apiGateway = new ApiGatewayV1Api(stack, "cdd-siri-sx-api", {
        cdk: {
            restApi: {
                restApiName: `cdd-siri-sx-api-${stack.stage}`,
                description: "API to retrieve Siri SX XML data",
            },
        },
    });

    const siriResource: Resource = apiGateway.cdk.restApi.root.addResource("siri-sx");

    const executeRole = new Role(stack, "cdd-siri-sx-api-gateway-s3-integration-role", {
        assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
        roleName: `cdd-siri-sx-api-gateway-s3-integration-role-${stack.stage}`,
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
        path: `${siriSXBucket.bucketName}/SIRI-SX.xml`,
        options: {
            credentialsRole: executeRole,
            passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
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
        methodResponses: [
            {
                statusCode: "200",
                responseParameters: {
                    "method.response.header.Content-Type": true,
                },
            },
        ],
    };

    siriResource.addMethod("GET", s3Integration, s3ObjectMethod);

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
