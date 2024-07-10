import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";

// Make journey stats compulsory after cancelFeatureFlag is removed
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

export const generateConsequenceStats = (key: string, disruption: Disruption, cancelFeatureFlag: boolean) => {
    if (disruption.consequences) {
        return disruption.consequences.reduce((acc: Record<string, Record<string, number>>, consequence) => {
            // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
            if (!acc.hasOwnProperty(key)) {
                acc[key] = initialConsequenceStatsValues(cancelFeatureFlag);
            }
            acc[key] = {
                totalConsequencesCount: acc[key].totalConsequencesCount + 1,
                servicesConsequencesCount:
                    consequence.consequenceType === "services"
                        ? acc[key].servicesConsequencesCount + 1
                        : acc[key].servicesConsequencesCount,
                servicesAffected:
                    consequence.consequenceType === "services"
                        ? acc[key].servicesAffected + consequence.services.length
                        : acc[key].servicesAffected,
                stopsConsequencesCount:
                    consequence.consequenceType === "stops"
                        ? acc[key].stopsConsequencesCount + 1
                        : acc[key].stopsConsequencesCount,
                stopsAffected:
                    consequence.consequenceType === "stops"
                        ? acc[key].stopsAffected + consequence.stops.length
                        : acc[key].stopsAffected,
                ...(cancelFeatureFlag
                    ? {
                          journeysConsequencesCount:
                              consequence.consequenceType === "journeys"
                                  ? acc[key].journeysConsequencesCount + 1
                                  : acc[key].journeysConsequencesCount,
                          journeysAffected:
                              consequence.consequenceType === "journeys"
                                  ? acc[key].journeysAffected + consequence.journeys.length
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
    if (Object.hasOwn(disruptionReasonCountObject, currentDisruptionReason)) {
        return {
            ...disruptionReasonCountObject,
            [currentDisruptionReason]: disruptionReasonCountObject[currentDisruptionReason] + 1,
        };
    }
    return {
        ...disruptionReasonCountObject,
        [currentDisruptionReason]: 1,
    };
};

export const generateSiriStats = (disruptions: Disruption[], cancelFeatureFlag: boolean) => {
    return disruptions.reduce((acc: Record<string, SiriStats>, disruption) => {
        const key = disruption.orgId ? disruption.orgId : "";
        const consequenceStats = generateConsequenceStats(key, disruption, cancelFeatureFlag);
        if (consequenceStats?.[key]) {
            if (!Object.hasOwn(acc, key)) {
                acc[key] = {
                    disruptionReasonCount: {},
                    totalDisruptionsCount: 0,
                    lastUpdated: "",
                    ...initialConsequenceStatsValues(cancelFeatureFlag),
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
                totalDisruptionsCount: acc[key].totalDisruptionsCount + 1,
                servicesConsequencesCount:
                    acc[key].servicesConsequencesCount + consequenceStats[key].servicesConsequencesCount,
                servicesAffected: acc[key].servicesAffected + consequenceStats[key].servicesAffected,
                stopsConsequencesCount: acc[key].stopsConsequencesCount + consequenceStats[key].stopsConsequencesCount,
                stopsAffected: acc[key].stopsAffected + consequenceStats[key].stopsAffected,
                ...(cancelFeatureFlag
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
