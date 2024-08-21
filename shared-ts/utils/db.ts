import { PrismaClient } from "@prisma/client";

export const getDbClient = () =>
    new PrismaClient().$extends({
        result: {
            disruptions: {
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
            disruptionsEdited: {
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
