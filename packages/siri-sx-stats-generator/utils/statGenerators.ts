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
    disruptionReasonCount: DisruptionReasonCount;
}

export interface DisruptionReasonCount {
    accident: number;
    breakDown: number;
    congestion: number;
    constructionWork: number;
    emergencyEngineeringWork: number;
    fog: number;
    flooding: number;
    heavySnowFall: number;
    highTemperatures: number;
    heavyRain: number;
    ice: number;
    incident: number;
    securityAlert: number;
    maintenanceWork: number;
    operatorCeasedTrading: number;
    overcrowded: number;
    signalProblem: number;
    roadClosed: number;
    roadworks: number;
    routeDiversion: number;
    specialEvent: number;
    industrialAction: number;
    signalFailure: number;
    repairWork: number;
    vandalism: number;
    unknown: number;
    escalatorFailure: number;
    insufficientDemand: number;
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

export const initialDisruptionReasonCount: DisruptionReasonCount = {
    accident: 0,
    breakDown: 0,
    congestion: 0,
    constructionWork: 0,
    emergencyEngineeringWork: 0,
    fog: 0,
    flooding: 0,
    heavySnowFall: 0,
    highTemperatures: 0,
    heavyRain: 0,
    ice: 0,
    incident: 0,
    securityAlert: 0,
    maintenanceWork: 0,
    operatorCeasedTrading: 0,
    overcrowded: 0,
    signalProblem: 0,
    roadClosed: 0,
    roadworks: 0,
    routeDiversion: 0,
    specialEvent: 0,
    industrialAction: 0,
    signalFailure: 0,
    repairWork: 0,
    vandalism: 0,
    unknown: 0,
    escalatorFailure: 0,
    insufficientDemand: 0,
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

export const generateReasonCountStats = (disruptionReason: string, currentStat: DisruptionReasonCount) => {
    return {
        accident: disruptionReason === "accident" ? currentStat.accident + 1 : currentStat.accident,
        breakDown: disruptionReason === "breakDown" ? currentStat.breakDown + 1 : currentStat.breakDown,
        congestion: disruptionReason === "congestion" ? currentStat.congestion + 1 : currentStat.congestion,
        constructionWork:
            disruptionReason === "constructionWork" ? currentStat.constructionWork + 1 : currentStat.constructionWork,
        emergencyEngineeringWork:
            disruptionReason === "emergencyEngineeringWork"
                ? currentStat.emergencyEngineeringWork + 1
                : currentStat.emergencyEngineeringWork,
        fog: disruptionReason === "fog" ? currentStat.fog + 1 : currentStat.fog,
        flooding: disruptionReason === "flooding" ? currentStat.flooding + 1 : currentStat.flooding,
        heavySnowFall: disruptionReason === "heavySnowFall" ? currentStat.heavySnowFall + 1 : currentStat.heavySnowFall,
        highTemperatures:
            disruptionReason === "highTemperatures" ? currentStat.highTemperatures + 1 : currentStat.highTemperatures,
        heavyRain: disruptionReason === "heavyRain" ? currentStat.heavyRain + 1 : currentStat.heavyRain,
        ice: disruptionReason === "ice" ? currentStat.ice + 1 : currentStat.ice,
        incident: disruptionReason === "incident" ? currentStat.incident + 1 : currentStat.incident,
        securityAlert: disruptionReason === "securityAlert" ? currentStat.securityAlert + 1 : currentStat.securityAlert,
        maintenanceWork:
            disruptionReason === "maintenanceWork" ? currentStat.maintenanceWork + 1 : currentStat.maintenanceWork,
        operatorCeasedTrading:
            disruptionReason === "operatorCeasedTrading"
                ? currentStat.operatorCeasedTrading + 1
                : currentStat.operatorCeasedTrading,
        overcrowded: disruptionReason === "overcrowded" ? currentStat.overcrowded + 1 : currentStat.overcrowded,
        signalProblem: disruptionReason === "signalProblem" ? currentStat.signalProblem + 1 : currentStat.signalProblem,
        roadClosed: disruptionReason === "roadClosed" ? currentStat.roadClosed + 1 : currentStat.roadClosed,
        roadworks: disruptionReason === "roadworks" ? currentStat.roadworks + 1 : currentStat.roadworks,
        routeDiversion:
            disruptionReason === "routeDiversion" ? currentStat.routeDiversion + 1 : currentStat.routeDiversion,
        specialEvent: disruptionReason === "specialEvent" ? currentStat.specialEvent + 1 : currentStat.specialEvent,
        industrialAction:
            disruptionReason === "industrialAction" ? currentStat.industrialAction + 1 : currentStat.industrialAction,
        signalFailure: disruptionReason === "signalFailure" ? currentStat.signalFailure + 1 : currentStat.signalFailure,
        repairWork: disruptionReason === "repairWork" ? currentStat.repairWork + 1 : currentStat.repairWork,
        vandalism: disruptionReason === "vandalism" ? currentStat.vandalism + 1 : currentStat.vandalism,
        unknown: disruptionReason === "unknown" ? currentStat.unknown + 1 : currentStat.unknown,
        escalatorFailure:
            disruptionReason === "escalatorFailure" ? currentStat.escalatorFailure + 1 : currentStat.escalatorFailure,
        insufficientDemand:
            disruptionReason === "insufficientDemand"
                ? currentStat.insufficientDemand + 1
                : currentStat.insufficientDemand,
    };
};
