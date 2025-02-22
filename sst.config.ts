import { SSTConfig } from "sst";
import { CognitoStack } from "./stacks/CognitoStack";
import { DnsStack } from "./stacks/DnsStack";
import { DynamoDBStack } from "./stacks/DynamoDBStack";
import { DynamoMigratorStack } from "./stacks/DynamoMigratorStack";
import { MonitoringStack } from "./stacks/MonitoringStack";
import { RdsStack } from "./stacks/RdsStack";
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
    },
} satisfies SSTConfig;
