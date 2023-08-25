import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
    Consequence,
    DisruptionInfo,
    Stop,
    Validity,
    Service,
    ConsequenceOperators,
} from "@create-disruptions-data/shared-ts/disruptionTypes";
import { consequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { AffectedOperator, PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { disruption } from "@create-disruptions-data/siri-sx-generator/test/testData";
import cryptoRandomString from "crypto-random-string";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { parseString } from "xml2js";
import { parseBooleans } from "xml2js/lib/processors";
import { undefined, z } from "zod";
import * as console from "console";
import { promises as fs } from "fs";
import * as util from "util";
import { AffectedLine, Affects, consequenceItem, siriSchema, StopPoints, Operators } from "./reverseSiriTypes.zod";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

dayjs.extend(utc);
dayjs.extend(timezone);

export const organisationSchema = z
    .object({
        PK: z.string(),
        name: z.string(),
        mode: z.coerce.string().optional(),
        adminAreaCodes: z.coerce.string(),
    })
    .array();

export type Organisation = z.infer<typeof organisationSchema>;

export const convertDateTimeToFormat = (dateOrTime: string | Date | undefined, format: "DD/MM/YYYY" | "HHmm") => {
    return dayjs(dateOrTime).tz("Europe/London").format(format);
};

async function loadXml() {
    const data = await fs.readFile("smaller-sirisx.xml", "utf8");
    return data;
}

const xml = await loadXml();

const parsedXml = () => {
    let parsedXml: { Siri: any } = { Siri: {} };
    let error = null;

    parseString(xml, { explicitArray: false, valueProcessors: [parseBooleans] }, function (err, result) {
        error = err;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parsedXml = result;
    });

    return {
        parsedXml,
        error,
    };
};

// console.log(util.inspect(parsedXml().parsedXml.Siri, false, null));

const parsedJson = siriSchema.parse(parsedXml().parsedXml.Siri);

const getDisruptionReason = (disruption: PtSituationElement) => {
    switch (disruption.ReasonType) {
        case "EnvironmentReason":
            return disruption.EnvironmentReason;
        case "EquipmentReason":
            return disruption.EquipmentReason;
        case "PersonnelReason":
            return disruption.PersonnelReason;
        case "MiscellaneousReason":
            return disruption.MiscellaneousReason;
    }
};

// const singleDisruption = parsedJson.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement[2];

type ValidityPeriodItem = {
    StartTime?: string | Date;
    EndTime?: string | Date;
};

interface DisruptionAndValidityDates {
    disruptionDatesAndTimes: ValidityPeriodItem;
    validityDatesAndTimes: ValidityPeriodItem[] | [];
}

const compareStartDate = (a: ValidityPeriodItem, b: ValidityPeriodItem) => {
    const dateBIsBeforeA = dayjs(b.StartTime).isBefore(dayjs(a.StartTime));
    return dateBIsBeforeA ? 1 : -1;
};
const getDisruptionAndValidityDates = (disruption: PtSituationElement): DisruptionAndValidityDates => {
    let disruptionDatesAndTimes = {};
    const validityDatesAndTimes = [];

    const sortedDisruptionValidityPeriods = disruption.ValidityPeriod.sort(compareStartDate).reverse();
    disruptionDatesAndTimes = sortedDisruptionValidityPeriods[0];

    if (sortedDisruptionValidityPeriods.length > 1) {
        validityDatesAndTimes.push(...sortedDisruptionValidityPeriods.slice(1));
    }

    return {
        disruptionDatesAndTimes,
        validityDatesAndTimes,
    };
};

const formatValidityArray = (validityDatesAndTimes: ValidityPeriodItem[]): Validity[] | [] => {
    if (validityDatesAndTimes.length == 0) {
        return [];
    }
    return validityDatesAndTimes.map((item): Validity => {
        return {
            disruptionEndDate: !!item.EndTime ? convertDateTimeToFormat(item.EndTime, "DD/MM/YYYY") : "",
            disruptionEndTime: !!item.EndTime ? convertDateTimeToFormat(item.EndTime, "HHmm") : "",
            disruptionNoEndDateTime: !item.EndTime ? "true" : "",
            disruptionRepeats: "doesntRepeat",
            disruptionRepeatsEndDate: "",
            disruptionStartDate: convertDateTimeToFormat(item.StartTime, "DD/MM/YYYY"),
            disruptionStartTime: convertDateTimeToFormat(item.StartTime, "HHmm"),
        };
    });
};

const getOrgIdFromDynamo = async (participantRef: string, tableName: string): Promise<string> => {
    const dbData = await ddbDocClient.send(
        new ScanCommand({
            TableName: tableName,
        }),
    );

    const parsedOrg = organisationSchema.parse(dbData.Items);

    const filteredOrg: Organisation = parsedOrg.filter((item) => item.name === participantRef);

    return !!filteredOrg ? filteredOrg[0].PK : "";
};

const disruptionsInfo = await Promise.all(
    parsedJson.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement.map(
        async (item): Promise<DisruptionInfo> => {
            const { disruptionDatesAndTimes, validityDatesAndTimes } = getDisruptionAndValidityDates(item);
            const orgId = await getOrgIdFromDynamo(item.ParticipantRef, "cdd-organisations-table-deannasharma");
            return {
                disruptionId: item.SituationNumber,
                disruptionReason: getDisruptionReason(item),
                disruptionType: item.Planned ? "planned" : "unplanned",
                associatedLink: item.InfoLinks?.InfoLink[0].Uri,
                description: item.Description,
                displayId: cryptoRandomString({ length: 6 }),
                summary: item.Summary,
                orgId: orgId,
                disruptionStartDate: convertDateTimeToFormat(disruptionDatesAndTimes.StartTime, "DD/MM/YYYY"),
                disruptionStartTime: convertDateTimeToFormat(disruptionDatesAndTimes.StartTime, "HHmm"),
                disruptionEndDate: !!disruptionDatesAndTimes.EndTime
                    ? convertDateTimeToFormat(disruptionDatesAndTimes.EndTime, "DD/MM/YYYY")
                    : "",
                disruptionEndTime: !!disruptionDatesAndTimes.EndTime
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

export type ConsequenceItem = z.infer<typeof consequenceItem>;

type ConsequenceAttribute = "Severity" | "Condition" | "Advice" | "Blocking" | "Delays";

const getConsequenceAttribute = (
    disruption: PtSituationElement,
    consequenceIndex: number,
    consequenceAttribute: ConsequenceAttribute,
): string | Record<string, any> | undefined => {
    const consequenceAttributesArray = disruption.Consequences?.Consequence.map((consequence) => {
        return consequence[consequenceAttribute];
    });
    return !!consequenceAttributesArray ? consequenceAttributesArray[consequenceIndex] : undefined;
};
const getRemoveFromJourneyPlanners = (disruption: PtSituationElement, consequenceIndex: number) => {
    const JourneyPlanner: boolean[] | undefined = disruption.Consequences?.Consequence.map((consequence) => {
        return consequence.Blocking.JourneyPlanner;
    });
    return !!JourneyPlanner ? JourneyPlanner[consequenceIndex] : undefined;
};

const getConsequenceType = (affectsItem: Affects) => {
    if (affectsItem.Operators?.AllOperators == "" && !!affectsItem.StopPoints) {
        return "stops";
    }
    if (affectsItem.Operators?.AllOperators == "" && !affectsItem.StopPoints) {
        return "networkWide";
    }
    if (!!affectsItem.Networks?.AffectedNetwork.AffectedLine) {
        return "services";
    } else {
        return "operatorWide";
    }
};

const getStops = (stopPoints: StopPoints) => {
    return stopPoints.AffectedStopPoint.map((stop): Stop => {
        return {
            commonName: stop.StopPointName,
            atcoCode: stop.StopPointRef,
            latitude: stop.Location.Latitude,
            longitude: stop.Location.Longitude,
        };
    });
};

const getVehicleMode = (affectsItem: Affects) => {
    if (affectsItem.StopPoints) {
        return affectsItem.StopPoints.AffectedStopPoint.map((stop) => stop.AffectedModes.Mode.VehicleMode)[0];
    } else return affectsItem.Networks?.AffectedNetwork.VehicleMode ?? VehicleMode.bus;
};

// const getServices = (affectedLine: AffectedLine) => {
//     return affectedLine.map((service) => {
//         return {
//             id: "",
//             origin: "",
//             destination: "",
//             lineName: service.LineRef,
//             nocCode: service.AffectedOperator.OperatorRef,
//             operatorShortName: service.AffectedOperator.OperatorName,
//         };
//     });
// };

const mockService = [
    {
        id: 1212,
        lineName: "72A",
        operatorShortName: "Bobs Buses",
        destination: "Town",
        origin: "Station",
        nocCode: "BB",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
];

const getDisruptionDirection = (affectedLine: AffectedLine) => {
    return affectedLine
        ? affectedLine.map((service) =>
              service.Direction?.DirectionRef === "inboundTowardsTown" ? "inbound" : "outbound",
          )[0]
        : "allDirections";
};

const mockConsequenceOperators = [
    {
        operatorNoc: "mock",
        operatorPublicName: "mock",
    },
];

//TODO DEANNA Replace mockService with getServices function

const extractConsequences = (disruption: PtSituationElement) => {
    return disruption.Consequences?.Consequence.map((item, index) => {
        const consequenceType = getConsequenceType(item.Affects);
        if (consequenceType === "stops" && item.Affects.StopPoints) {
            const stops = getStops(item.Affects.StopPoints);
            return {
                disruptionId: disruption.SituationNumber,
                disruptionSeverity: item.Severity,
                removeFromJourneyPlanners: item.Blocking.JourneyPlanner ? "yes" : "no",
                disruptionDelay: item.Delays?.Delay.substring(
                    item.Delays?.Delay.indexOf("T") + 1,
                    item.Delays?.Delay.lastIndexOf("M"),
                ),
                consequenceIndex: index,
                consequenceType: consequenceType,
                description: disruption.Description,
                stops: stops,
                vehicleMode: getVehicleMode(item.Affects),
            };
        }
        if (consequenceType === "services" && item.Affects.Networks) {
            return {
                disruptionId: disruption.SituationNumber,
                disruptionSeverity: item.Severity,
                removeFromJourneyPlanners: item.Blocking.JourneyPlanner ? "yes" : "no",
                disruptionDelay: item.Delays?.Delay.substring(
                    item.Delays?.Delay.indexOf("T") + 1,
                    item.Delays?.Delay.lastIndexOf("M"),
                ),
                consequenceIndex: index,
                consequenceType: consequenceType,
                description: disruption.Description,
                vehicleMode: getVehicleMode(item.Affects),
                services: mockService,
                disruptionDirection: getDisruptionDirection(item.Affects.Networks.AffectedNetwork.AffectedLine),
            };
        }
        if (consequenceType === "operatorWide" && item.Affects.Operators) {
            return {
                disruptionId: disruption.SituationNumber,
                disruptionSeverity: item.Severity,
                removeFromJourneyPlanners: item.Blocking.JourneyPlanner ? "yes" : "no",
                disruptionDelay: item.Delays?.Delay.substring(
                    item.Delays?.Delay.indexOf("T") + 1,
                    item.Delays?.Delay.lastIndexOf("M"),
                ),
                consequenceIndex: index,
                consequenceType: consequenceType,
                description: disruption.Description,
                vehicleMode: getVehicleMode(item.Affects),
                consequenceOperators: mockConsequenceOperators,
            };
        }
        if (consequenceType === "networkWide") {
            return {
                disruptionId: disruption.SituationNumber,
                disruptionSeverity: item.Severity,
                removeFromJourneyPlanners: item.Blocking.JourneyPlanner ? "yes" : "no",
                disruptionDelay: item.Delays?.Delay.substring(
                    item.Delays?.Delay.indexOf("T") + 1,
                    item.Delays?.Delay.lastIndexOf("M"),
                ),
                consequenceIndex: index,
                consequenceType: consequenceType,
                description: disruption.Description,
                vehicleMode: getVehicleMode(item.Affects),
            };
        }
    });
};

// console.log(
//     util.inspect(parsedJson.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement[3], false, null),
// );
//
console.log(
    util.inspect(
        extractConsequences(parsedJson.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement[3]),
        false,
        null,
    ),
);
