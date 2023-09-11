import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { getPublishedDisruptionsDataFromDynamo } from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

interface siriStats {
    totalDisruptionsCount: number;
    servicesConsequencesCount: number;
    servicesAffected: number;
    stopsConsequencesCount: number;
    stopsAffected: number;
    networkWideConsequencesCount: number;
    operatorWideConsequencesCount: number;
    totalConsequencesCount: number;
}
const getSiriStats = async (disruptionsTableName: string) => {
    const disruptions = await getPublishedDisruptionsDataFromDynamo(disruptionsTableName);

    const setInitialConsequenceStatsValues = {
        totalConsequencesCount: 0,
        servicesConsequencesCount: 0,
        servicesAffected: 0,
        stopsConsequencesCount: 0,
        stopsAffected: 0,
        networkWideConsequencesCount: 0,
        operatorWideConsequencesCount: 0,
    };

    const getConsequenceStats = (key: string, disruption: Disruption) => {
        if (disruption.consequences) {
            return disruption.consequences.reduce((acc: Record<string, Record<string, number>>, consequence) => {
                if (!acc.hasOwnProperty(key)) {
                    acc[key] = setInitialConsequenceStatsValues;
                }
                acc[key] = {
                    totalConsequencesCount: acc[key].totalConsequencesCount + 1,
                    servicesConsequencesCount:
                        consequence.consequenceType === "services"
                            ? acc[key].servicesConsequencesCount + 1
                            : acc[key].servicesConsequencesCount,
                    servicesAffected:
                        consequence.consequenceType === "services"
                            ? consequence.services.length
                            : acc[key].servicesAffected,
                    stopsConsequencesCount:
                        consequence.consequenceType === "stops"
                            ? acc[key].stopsConsequencesCount + 1
                            : acc[key].stopsConsequencesCount,
                    stopsAffected:
                        consequence.consequenceType === "stops" ? consequence.stops.length : acc[key].stopsAffected,
                    networkWideConsequencesCount:
                        consequence.consequenceType === "networkWide"
                            ? acc[key].networkWideConsequencesCount + 1
                            : acc[key].networkWideConsequencesCount,
                    operatorWideConsequencesCount:
                        consequence.consequenceType === "operatorWide"
                            ? acc[key].operatorWideConsequencesCount + 1
                            : acc[key].operatorWideConsequencesCount,
                };
                return acc;
            }, {});
        }
        return null;
    };

    const siriStatsByOrg = disruptions.reduce((acc: Record<string, siriStats>, disruption) => {
        const key = disruption.orgId ? disruption.orgId : "";
        const consequenceStats = getConsequenceStats(key, disruption);
        if (consequenceStats) {
            if (!acc.hasOwnProperty(key)) {
                acc[key] = { totalDisruptionsCount: 0, ...setInitialConsequenceStatsValues };
            }
            acc[key] = {
                totalDisruptionsCount: acc[key].totalDisruptionsCount + 1,
                servicesConsequencesCount:
                    acc[key].servicesConsequencesCount + consequenceStats[key].servicesConsequencesCount,
                servicesAffected: acc[key].servicesAffected + consequenceStats[key].servicesAffected,
                stopsConsequencesCount: acc[key].stopsConsequencesCount + consequenceStats[key].stopsConsequencesCount,
                stopsAffected: acc[key].stopsAffected + consequenceStats[key].stopsAffected,
                networkWideConsequencesCount:
                    acc[key].networkWideConsequencesCount + consequenceStats[key].networkWideConsequencesCount,
                operatorWideConsequencesCount:
                    acc[key].operatorWideConsequencesCount + consequenceStats[key].operatorWideConsequencesCount,
                totalConsequencesCount: acc[key].totalConsequencesCount + consequenceStats[key].totalConsequencesCount,
            };
        }
        return acc;
    }, {});

    return siriStatsByOrg;
};

export const main = async (): Promise<void> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };
        logger.info("Starting SIRI-SX stats generator...");

        const { DISRUPTIONS_TABLE_NAME: disruptionsTableName, ORGANISATIONS_TABLE_NAME: orgTableName } = process.env;

        if (!disruptionsTableName || !orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        const siriStats = await getSiriStats(disruptionsTableName);
        //TODO DEANNA remove when finished ticket
        logger.info(siriStats);
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
