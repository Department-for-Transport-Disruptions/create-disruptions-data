import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";

// Make journey stats compulsory after CANCELLATION_FEATURE_FLAG is removed
export interface SiriStats {
    servicesConsequencesCount: number;
    servicesAffected: number;
    stopsConsequencesCount: number;
    stopsAffected: number;
    journeysConsequencesCount?: number;
    journeysAffected?: number;
    networkWideConsequencesCount: number;
    operatorWideConsequencesCount: number;
    totalConsequencesCount: number;
    totalDisruptionsCount: number;
    disruptionReasonCount: Record<string, number>;
    lastUpdated: string;
}

export const initialConsequenceStatsValues = (cancelFeatureFlag: boolean) => ({
    totalConsequencesCount: 0,
    servicesConsequencesCount: 0,
    servicesAffected: 0,
    stopsConsequencesCount: 0,
    stopsAffected: 0,
    ...(cancelFeatureFlag ? { journeysConsequencesCount: 0, journeysAffected: 0 } : {}),
    networkWideConsequencesCount: 0,
    operatorWideConsequencesCount: 0,
});

export const generateConsequenceStats = (key: string, disruption: Disruption) => {
    const { STAGE: stage } = process.env;
    const CANCELLATION_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");
    if (disruption.consequences) {
        return disruption.consequences.reduce((acc: Record<string, Record<string, number>>, consequence) => {
            if (!acc.hasOwnProperty(key)) {
                acc[key] = initialConsequenceStatsValues(CANCELLATION_FEATURE_FLAG);
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
                ...(CANCELLATION_FEATURE_FLAG
                    ? {
                          journeysConsequencesCount:
                              consequence.consequenceType === "journeys"
                                  ? acc[key].journeysConsequencesCount + 1
                                  : acc[key].journeysConsequencesCount,
                          journeysAffected:
                              consequence.consequenceType === "journeys"
                                  ? consequence.journeys.length
                                  : acc[key].journeysAffected,
                      }
                    : {}),
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

export const generateDisruptionReasonCount = (
    currentDisruptionReason: string,
    disruptionReasonCountObject: Record<string, number>,
) => {
    if (disruptionReasonCountObject.hasOwnProperty(currentDisruptionReason)) {
        return {
            ...disruptionReasonCountObject,
            [currentDisruptionReason]: disruptionReasonCountObject[currentDisruptionReason] + 1,
        };
    } else {
        return {
            ...disruptionReasonCountObject,
            [currentDisruptionReason]: 1,
        };
    }
};

export const generateSiriStats = (disruptions: Disruption[]) => {
    const { STAGE: stage } = process.env;
    const CANCELLATION_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");
    return disruptions.reduce((acc: Record<string, SiriStats>, disruption) => {
        const key = disruption.orgId ? disruption.orgId : "";
        const consequenceStats = generateConsequenceStats(key, disruption);
        if (consequenceStats?.[key]) {
            if (!acc.hasOwnProperty(key)) {
                acc[key] = {
                    disruptionReasonCount: {},
                    totalDisruptionsCount: 0,
                    lastUpdated: "",
                    ...initialConsequenceStatsValues(CANCELLATION_FEATURE_FLAG),
                };
            }

            let lastUpdated = "";

            if (!!acc[key].lastUpdated && !!disruption.lastUpdated) {
                lastUpdated = getDate(disruption.lastUpdated).isAfter(getDate(acc[key].lastUpdated))
                    ? disruption.lastUpdated
                    : acc[key].lastUpdated;
            } else if (disruption.lastUpdated || acc[key].lastUpdated) {
                lastUpdated = disruption.lastUpdated || acc[key].lastUpdated;
            }

            acc[key] = {
                disruptionReasonCount: generateDisruptionReasonCount(
                    disruption.disruptionReason,
                    acc[key].disruptionReasonCount,
                ),
                totalDisruptionsCount: (acc[key].totalDisruptionsCount += 1),
                servicesConsequencesCount:
                    acc[key].servicesConsequencesCount + consequenceStats[key].servicesConsequencesCount,
                servicesAffected: acc[key].servicesAffected + consequenceStats[key].servicesAffected,
                stopsConsequencesCount: acc[key].stopsConsequencesCount + consequenceStats[key].stopsConsequencesCount,
                stopsAffected: acc[key].stopsAffected + consequenceStats[key].stopsAffected,
                ...(CANCELLATION_FEATURE_FLAG
                    ? {
                          journeysConsequencesCount:
                              acc[key]?.journeysConsequencesCount ||
                              0 + consequenceStats[key].journeysConsequencesCount,
                          journeysAffected: acc[key]?.journeysAffected || 0 + consequenceStats[key].journeysAffected,
                      }
                    : {}),
                networkWideConsequencesCount:
                    acc[key].networkWideConsequencesCount + consequenceStats[key].networkWideConsequencesCount,
                operatorWideConsequencesCount:
                    acc[key].operatorWideConsequencesCount + consequenceStats[key].operatorWideConsequencesCount,
                totalConsequencesCount: acc[key].totalConsequencesCount + consequenceStats[key].totalConsequencesCount,
                lastUpdated,
            };
        }
        return acc;
    }, {});
};
