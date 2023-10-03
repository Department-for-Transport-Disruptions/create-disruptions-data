import {
    AuthorizationType,
    AwsIntegration,
    MethodOptions,
    PassthroughBehavior,
    Resource,
} from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import { ApiGatewayV1Api, Stack, Bucket, use } from "sst/constructs";
import { DynamoDBStack } from "../DynamoDBStack";

export const createSiriApi = (stack: Stack, siriSXBucket: Bucket, hostedZone: IHostedZone): void => {
    const subDomain = ["test", "preprod", "prod"].includes(stack.stage) ? "api" : `api.${stack.stage}`;
    const { organisationsTableV2: organisationsTable, disruptionsTable } = use(DynamoDBStack);

    const apiGateway = new ApiGatewayV1Api(stack, "cdd-siri-sx-api", {
        customDomain: {
            domainName: `${subDomain}.${hostedZone.zoneName}`,
            hostedZone: hostedZone.zoneName,
            path: "v1",
            securityPolicy: "TLS 1.2",
            endpointType: "edge",
        },
        cdk: {
            restApi: {
                restApiName: `cdd-siri-sx-api-${stack.stage}`,
                description: "API to retrieve Siri SX XML data and includes statistics about this data",
            },
        },
        defaults: {
            function: {
                timeout: 20,
                environment: {
                    ORGANISATIONS_TABLE_NAME: organisationsTable.tableName,
                    DISRUPTIONS_TABLE_NAME: disruptionsTable.tableName,
                },
                permissions: ["dynamodb:Scan", "dynamodb:Query"],
            },
        },
        routes: {
            "GET    /organisations": {
                function: "packages/organisations-api/get-organisations/index.main",
                cdk: { method: { apiKeyRequired: true } },
            },
            "GET    /organisations/{id}": {
                function: "packages/organisations-api/get-organisation/index.main",
                cdk: { method: { apiKeyRequired: true } },
            },
            "GET    /organisations/{id}/impacted/stops": {
                function: "packages/organisations-api/get-organisation-stops/index.main",
                cdk: { method: { apiKeyRequired: true } },
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

    const s3Integration = new AwsIntegration({
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
