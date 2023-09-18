import { consequenceSchema, disruptionInfoSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";

export type Disruption = z.infer<typeof disruptionSchema>;
export const disruptionSchema = disruptionInfoSchema.and(
    z.object({
        consequences: z
            .array(consequenceSchema)
            .max(10, {
                message: "Only up to 10 consequences can be added",
            })
            .optional(),
        publishStatus: z.nativeEnum(PublishStatus).default(PublishStatus.draft),
        template: z.boolean().optional().default(false),
    }),
);

export interface SiriStats {
    servicesConsequencesCount: number;
    servicesAffected: number;
    stopsConsequencesCount: number;
    stopsAffected: number;
    networkWideConsequencesCount: number;
    operatorWideConsequencesCount: number;
    totalConsequencesCount: number;
    disruptionReasonCount: Record<string, number>;
}

export const initialConsequenceStatsValues = {
    totalConsequencesCount: 0,
    servicesConsequencesCount: 0,
    servicesAffected: 0,
    stopsConsequencesCount: 0,
    stopsAffected: 0,
    networkWideConsequencesCount: 0,
    operatorWideConsequencesCount: 0,
};

export const generateConsequenceStats = (key: string, disruption: Disruption) => {
    if (disruption.consequences) {
        return disruption.consequences.reduce((acc: Record<string, Record<string, number>>, consequence) => {
            if (!acc.hasOwnProperty(key)) {
                acc[key] = initialConsequenceStatsValues;
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
    return disruptions.reduce((acc: Record<string, SiriStats>, disruption) => {
        const key = disruption.orgId ? disruption.orgId : "";
        const consequenceStats = generateConsequenceStats(key, disruption);
        if (consequenceStats) {
            if (!acc.hasOwnProperty(key)) {
                acc[key] = {
                    disruptionReasonCount: {},
                    ...initialConsequenceStatsValues,
                };
            }
            acc[key] = {
                disruptionReasonCount: generateDisruptionReasonCount(
                    disruption.disruptionReason,
                    acc[key].disruptionReasonCount,
                ),
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
};
