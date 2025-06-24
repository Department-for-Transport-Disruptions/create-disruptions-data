import { SSTConfig } from "sst";
import { CognitoStack } from "./stacks/CognitoStack";
import { DnsStack } from "./stacks/DnsStack";
import { DynamoDBStack } from "./stacks/DynamoDBStack";
import { DynamoMigratorStack } from "./stacks/DynamoMigratorStack";
import { MonitoringStack } from "./stacks/MonitoringStack";
import { QueueStack } from "./stacks/QueueStack";
import { RdsStack } from "./stacks/RdsStack";
import { RefDataServiceApiStack } from "./stacks/RefDataServiceApiStack";
import { RefDataStepFunctionStack } from "./stacks/RefDataStepFunctionStack";
import { RoadworksNotificationStack } from "./stacks/RoadworksNotificationStack";
import { SiriAPIStack } from "./stacks/SiriAPIStack";
import { SiriGeneratorStack } from "./stacks/SiriGeneratorStack";
import { SiteStack } from "./stacks/SiteStack";
import { VpcStack } from "./stacks/VpcStack";

export default {
    config() {
        return {
            name: "create-disruptions-data",
            region: "eu-west-2",
        };
    },
    stacks(app) {
        app.setDefaultRemovalPolicy(app.mode === "dev" ? "destroy" : "retain");

        app.stack(VpcStack);
        app.stack(DnsStack);
        app.stack(RdsStack);
        app.stack(MonitoringStack);
        app.stack(CognitoStack);
        app.stack(DynamoDBStack);
        app.stack(SiteStack);
        app.stack(SiriGeneratorStack);
        app.stack(SiriAPIStack);
        app.stack(RoadworksNotificationStack);
        app.stack(DynamoMigratorStack);
        app.stack(RefDataStepFunctionStack);
        app.stack(QueueStack);
        app.stack(RefDataServiceApiStack);
    },
} satisfies SSTConfig;
