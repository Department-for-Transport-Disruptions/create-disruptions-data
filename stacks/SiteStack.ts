import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NextjsSite, StackContext, use } from "sst/constructs";
import { DnsStack } from "./DnsStack";
import { DynamoDBStack } from "./DynamoDBStack";

export function SiteStack({ stack }: StackContext) {
    const { table, siriTable } = use(DynamoDBStack);
    const { hostedZone } = use(DnsStack);

    const subDomain = ["test", "preprod", "prod"].includes(stack.stage) ? "" : `${stack.stage}.`;

    const apiUrl = !["preprod", "prod"].includes(stack.stage)
        ? "https://api.test.ref-data.dft-create-data.com/v1/"
        : `https://api.${stack.stage}.ref-data.dft-create-data.com/v1/`;

    const site = new NextjsSite(stack, "Site", {
        path: "site/",
        environment: {
            TABLE_NAME: table.tableName,
            SIRI_TABLE_NAME: siriTable.tableName,
            STAGE: stack.stage,
            API_BASE_URL: apiUrl,
            MAP_BOX_ACCESS_TOKEN: process.env.MAP_BOX_ACCESS_TOKEN || "",
            FEEDBACK_EMAIL_ADDRESS: stack.stage === "prod" ? "bodshelpdesk@kpmg.co.uk" : "feedback@dft-create-data.com",
            AWS_SES_IDENTITY_ARN: process.env.AWS_SES_IDENTITY_ARN || "",
        },
        customDomain: {
            domainName: `${subDomain}${hostedZone.zoneName}`,
            hostedZone: hostedZone.zoneName,
        },
        permissions: [
            new PolicyStatement({
                resources: [table.tableArn, siriTable.tableArn],
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
                actions: ["ses:SendEmail", "ses:SendRawEmail"],
            }),
        ],
        buildCommand: "npx -w @create-disruptions-data/site open-next@0.7.0 build",
    });

    stack.addOutputs({
        URL: site.url || "",
    });
}
