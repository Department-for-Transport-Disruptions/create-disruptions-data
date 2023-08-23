import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DisruptionInfo, Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import cryptoRandomString from "crypto-random-string";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { parseString } from "xml2js";
import { parseBooleans } from "xml2js/lib/processors";
import { z } from "zod";
import * as console from "console";
import { promises as fs } from "fs";
import * as util from "util";
import { siriSchema } from "./reverseSiriTypes.zod";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

dayjs.extend(utc);
dayjs.extend(timezone);

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
//TODO DEANNA test winter date and time

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

type OrgInfo = {
    PK: string;
    name: string;
    mode?: string;
    adminAreaCodes: string;
};

export const organisationSchema = z
    .object({
        PK: z.string(),
        name: z.string(),
        mode: z.coerce.string().optional(),
        adminAreaCodes: z.coerce.string(),
    })
    .array();

export type Organisation = z.infer<typeof organisationSchema>;

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
            const { disruptionDatesAndTimes } = getDisruptionAndValidityDates(item);
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
                validity: formatValidityArray(item.ValidityPeriod),
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

console.log(disruptionsInfo);
