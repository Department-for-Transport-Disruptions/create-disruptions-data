import * as console from "console";
import { promises as fs } from "fs";
import { Consequence, DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import cryptoRandomString from "crypto-random-string";
import { v5 as uuidv5 } from "uuid";
import { parseString } from "xml2js";
import { parseBooleans } from "xml2js/lib/processors";
import { getOrgIdFromDynamo, publishDisruptionAndConsequenceInfoToDynamo } from "./dynamo";
import {
    convertDateTimeToFormat,
    formatValidityArray,
    getConsequenceOperators,
    getConsequenceType,
    getDisruptionAndValidityDates,
    getDisruptionDirection,
    getDisruptionReason,
    getServices,
    getStops,
    getVehicleMode,
} from "./utils";
import { PtSituationElement, siriSchema } from "./utils/importerSiriTypes.zod";

const { STAGE_NAME: stageName, FILE_NAME: fileName } = process.env;

if (!stageName) {
    throw new Error("Stage name not set");
}

if (!fileName) {
    throw new Error("File name not provided");
}

const disruptionsTableName = `cdd-disruptions-table-${stageName}`;
const orgTableName = `cdd-organisations-v2-table-${stageName}`;

async function loadXml() {
    // @ts-ignore
    const data = await fs.readFile(fileName, "utf8");
    return data;
}

const xml = await loadXml();

const parsedXml = () => {
    let parsedXml = { Siri: {} };
    let error = null;

    parseString(xml, { explicitArray: false, valueProcessors: [parseBooleans], ignoreAttrs: true }, (err, result) => {
        error = err;
        parsedXml = result;
    });

    return {
        parsedXml,
        error,
    };
};

const addReasonTypeToXml = (Siri: Record<string, unknown>) => {
    // @ts-ignore
    let PtSituationElement = Siri.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement;
    if (!Array.isArray(PtSituationElement)) {
        PtSituationElement = [PtSituationElement];
    }
    const PtSituationElementWithReasonType = PtSituationElement.map((item: Record<string, unknown>) => {
        const fixedUuid = "bd1e919c-d98e-4744-b786-ebe0f0d980c2";
        // @ts-ignore
        const situationNumber: string = uuidv5(item.SituationNumber, fixedUuid);
        if (item.EnvironmentReason) {
            return {
                ...item,
                ReasonType: "EnvironmentReason",
                SituationNumber: situationNumber,
            };
        }
        if (item.EquipmentReason) {
            return {
                ...item,
                ReasonType: "EquipmentReason",
                SituationNumber: situationNumber,
            };
        }
        if (item.PersonnelReason) {
            return {
                ...item,
                ReasonType: "PersonnelReason",
                SituationNumber: situationNumber,
            };
        }
        if (item.MiscellaneousReason) {
            return {
                ...item,
                ReasonType: "MiscellaneousReason",
                SituationNumber: situationNumber,
            };
        }
        if (item.UndefinedReason) {
            return {
                ...item,
                MiscellaneousReason: "unknown",
                ReasonType: "MiscellaneousReason",
                SituationNumber: situationNumber,
            };
        }
    });

    // @ts-ignore
    Siri.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement = PtSituationElementWithReasonType;

    return {
        Siri,
    };
};

const parsedJson = siriSchema.parse(addReasonTypeToXml(parsedXml().parsedXml.Siri).Siri);

const disruptionsInfo = await Promise.all(
    parsedJson.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement.map(
        async (item): Promise<DisruptionInfo> => {
            const { disruptionDatesAndTimes, validityDatesAndTimes } = getDisruptionAndValidityDates(item);
            const orgId = await getOrgIdFromDynamo(item.ParticipantRef, orgTableName);
            return {
                disruptionId: item.SituationNumber,
                disruptionReason: getDisruptionReason(item),
                disruptionType: item.Planned ? "planned" : "unplanned",
                associatedLink: item.InfoLinks?.InfoLink[0].Uri ?? "",
                description: item.Description,
                displayId: cryptoRandomString({ length: 6 }),
                summary: item.Summary,
                orgId: orgId,
                disruptionStartDate: convertDateTimeToFormat(disruptionDatesAndTimes.StartTime, "DD/MM/YYYY"),
                disruptionStartTime: convertDateTimeToFormat(disruptionDatesAndTimes.StartTime, "HHmm"),
                disruptionEndDate: disruptionDatesAndTimes.EndTime
                    ? convertDateTimeToFormat(disruptionDatesAndTimes.EndTime, "DD/MM/YYYY")
                    : "",
                disruptionEndTime: disruptionDatesAndTimes.EndTime
                    ? convertDateTimeToFormat(disruptionDatesAndTimes.EndTime, "HHmm")
                    : "",
                disruptionNoEndDateTime: !disruptionDatesAndTimes.EndTime ? "true" : "",
                disruptionRepeats: "doesntRepeat",
                disruptionRepeatsEndDate: "",
                validity: formatValidityArray(validityDatesAndTimes),
                publishStartDate: convertDateTimeToFormat(item.PublicationWindow.StartTime, "DD/MM/YYYY"),
                publishStartTime: convertDateTimeToFormat(item.PublicationWindow.StartTime, "HHmm"),
                publishEndDate: item.PublicationWindow.EndTime
                    ? convertDateTimeToFormat(item.PublicationWindow.EndTime, "DD/MM/YYYY")
                    : "",
                publishEndTime: item.PublicationWindow.EndTime
                    ? convertDateTimeToFormat(item.PublicationWindow.EndTime, "HHmm")
                    : "",
            };
        },
    ),
);

const getConsequencesForGivenDisruption = async (disruption: PtSituationElement) => {
    return Promise.all(
        disruption.Consequences?.Consequence.map(async (item, index): Promise<Consequence | undefined> => {
            const consequenceType = getConsequenceType(item.Affects);
            const orgId = await getOrgIdFromDynamo(disruption.ParticipantRef, orgTableName);
            if (consequenceType === "stops" && item.Affects.StopPoints) {
                const stops = getStops(item.Affects.StopPoints);
                return {
                    orgId: orgId,
                    disruptionId: disruption.SituationNumber,
                    description: item.Advice.Details,
                    disruptionSeverity: item.Severity,
                    removeFromJourneyPlanners: item.Blocking.JourneyPlanner ? "yes" : "no",
                    disruptionDelay:
                        item.Delays?.Delay.substring(
                            item.Delays?.Delay.indexOf("T") + 1,
                            item.Delays?.Delay.lastIndexOf("M"),
                        ) ?? "",
                    consequenceIndex: index,
                    consequenceType: consequenceType,
                    stops: stops,
                    vehicleMode: getVehicleMode(item.Affects),
                };
            }
            if (consequenceType === "services" && item.Affects.Networks) {
                const services = await getServices(
                    item.Affects.Networks.AffectedNetwork.AffectedLine,
                    disruption.SituationNumber,
                );
                if (services.length === 0) {
                    console.log(
                        `could not generate database input for disruption ID: ${disruption.SituationNumber}, no matching services found.`,
                    );
                    return;
                }
                return {
                    orgId: orgId,
                    disruptionId: disruption.SituationNumber,
                    description: item.Advice.Details,
                    disruptionSeverity: item.Severity,
                    removeFromJourneyPlanners: item.Blocking.JourneyPlanner ? "yes" : "no",
                    disruptionDelay:
                        item.Delays?.Delay.substring(
                            item.Delays?.Delay.indexOf("T") + 1,
                            item.Delays?.Delay.lastIndexOf("M"),
                        ) ?? "",
                    consequenceIndex: index,
                    consequenceType: consequenceType,
                    vehicleMode: getVehicleMode(item.Affects),
                    services: services,
                    disruptionDirection: getDisruptionDirection(item.Affects.Networks.AffectedNetwork.AffectedLine),
                };
            }
            if (consequenceType === "operatorWide" && item.Affects.Operators?.AffectedOperator) {
                return {
                    orgId: orgId,
                    disruptionId: disruption.SituationNumber,
                    description: item.Advice.Details,
                    disruptionSeverity: item.Severity,
                    removeFromJourneyPlanners: item.Blocking.JourneyPlanner ? "yes" : "no",
                    disruptionDelay:
                        item.Delays?.Delay.substring(
                            item.Delays?.Delay.indexOf("T") + 1,
                            item.Delays?.Delay.lastIndexOf("M"),
                        ) ?? "",
                    consequenceIndex: index,
                    consequenceType: consequenceType,
                    vehicleMode: getVehicleMode(item.Affects),
                    consequenceOperators: getConsequenceOperators(item.Affects.Operators.AffectedOperator),
                };
            }
            if (consequenceType === "networkWide") {
                return {
                    orgId: orgId,
                    disruptionId: disruption.SituationNumber,
                    description: item.Advice.Details,
                    disruptionSeverity: item.Severity,
                    removeFromJourneyPlanners: item.Blocking.JourneyPlanner ? "yes" : "no",
                    disruptionDelay:
                        item.Delays?.Delay.substring(
                            item.Delays?.Delay.indexOf("T") + 1,
                            item.Delays?.Delay.lastIndexOf("M"),
                        ) ?? "",
                    consequenceIndex: index,
                    consequenceType: consequenceType,
                    vehicleMode: getVehicleMode(item.Affects),
                };
            }
        }) || [],
    );
};

const consequenceInfo: Consequence[][] = [];

for (const disruption of parsedJson.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement) {
    const consequences = await getConsequencesForGivenDisruption(disruption);

    if (consequences) {
        consequenceInfo.push(consequences.filter(notEmpty));
        console.log("Consequence generated...");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
}

publishDisruptionAndConsequenceInfoToDynamo(
    disruptionsInfo,
    consequenceInfo.flat(1).filter(notEmpty),
    disruptionsTableName,
);
