import { SSTConfig } from "sst";
import { SiriGeneratorStack } from "./stacks/SiriGeneratorStack";
import { SiteStack } from "./stacks/Site";

export default {
    config() {
        return {
            name: "create-disruptions-data",
            region: "eu-west-2",
        };
    },
    stacks(app) {
        app.stack(SiteStack);
        app.stack(SiriGeneratorStack);
    },
} satisfies SSTConfig;
