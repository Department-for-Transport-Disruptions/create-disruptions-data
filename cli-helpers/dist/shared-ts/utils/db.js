import { PrismaClient } from "@prisma/client";
import { Config } from "sst/node/config";
export const getDbClient = () => new PrismaClient({
    // @ts-ignore
    datasourceUrl: Config.DB_CONNECTION_STRING,
}).$extends({
    result: {
        disruption: {
            disruptionId: {
                needs: { id: true },
                compute(disruption) {
                    return disruption.id;
                },
            },
            creationTime: {
                needs: { creationTime: true },
                compute(disruption) {
                    return disruption.creationTime.toISOString();
                },
            },
            lastUpdated: {
                needs: { lastUpdated: true },
                compute(disruption) {
                    return disruption.lastUpdated.toISOString();
                },
            },
        },
        disruptionEdited: {
            disruptionId: {
                needs: { id: true },
                compute(disruption) {
                    return disruption.id;
                },
            },
            creationTime: {
                needs: { creationTime: true },
                compute(disruption) {
                    return disruption.creationTime.toISOString();
                },
            },
            lastUpdated: {
                needs: { lastUpdated: true },
                compute(disruption) {
                    return disruption.lastUpdated.toISOString();
                },
            },
        },
    },
});
