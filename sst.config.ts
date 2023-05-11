import { SSTConfig } from "sst";
import { CognitoStack } from "./stacks/CognitoStack";
import { DnsStack } from "./stacks/DnsStack";
import { DynamoDBStack } from "./stacks/DynamoDBStack";
import { SiriAPIStack } from "./stacks/SiriAPIStack";
import { SiriGeneratorStack } from "./stacks/SiriGeneratorStack";
import { SiteStack } from "./stacks/SiteStack";

export default {
    config() {
        return {
            name: "create-disruptions-data",
            region: "eu-west-2",
        };
    },
    stacks(app) {
        app.stack(DnsStack);
        app.stack(CognitoStack);
        app.stack(DynamoDBStack);
        app.stack(SiteStack);
        app.stack(SiriGeneratorStack);
        app.stack(SiriAPIStack);
    },
} satisfies SSTConfig;
