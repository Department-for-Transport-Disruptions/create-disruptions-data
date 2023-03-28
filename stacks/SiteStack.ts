import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NextjsSite, StackContext, use } from "sst/constructs";
import { DnsStack } from "./DnsStack";
import { DynamoDBStack } from "./DynamoDBStack";

export function SiteStack({ stack }: StackContext) {
    const { table } = use(DynamoDBStack);
    const { hostedZone } = use(DnsStack);

    const subDomain = ["test", "preprod", "prod"].includes(stack.stage) ? "" : `${stack.stage}.`;

    const apiUrl = !["preprod", "prod"].includes(stack.stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1/"
        : `https://api.${stack.stage}.ref-data.dft-create-data.com/v1/`;

    const site = new NextjsSite(stack, "Site", {
        path: "site/",
        environment: {
            TABLE_NAME: table.tableName,
            API_BASE_URL: apiUrl,
            EMAIL_ADDRESS: stack.stage === "prod" ? "bodshelpdesk@kpmg.co.uk" : "feedback@dft-create-data.com",
            AWS_SES_TEST_IDENTITY: process.env.AWS_SES_TEST_IDENTITY || "",
        },
        customDomain: {
            domainName: `${subDomain}${hostedZone.zoneName}`,
            hostedZone: hostedZone.zoneName,
        },
        permissions: [
            new PolicyStatement({
                resources: [table.tableArn],
                actions: [
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:BatchGetItem",
                    "dynamodb:BatchWriteItem",
                ],
            }),
            new PolicyStatement({
                resources: ["*"],
                actions: ["ses:SendRawEmail"],
            }),
        ],
    });

    stack.addOutputs({
        URL: site.url || "",
    });
}
