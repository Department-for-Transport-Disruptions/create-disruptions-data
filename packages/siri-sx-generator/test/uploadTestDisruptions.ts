/* eslint-disable no-console */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { randomUUID } from "crypto";
import { baseConsequences, baseSiteDisruptionInfo } from "./testData";
import { DisruptionInfo, Validity } from "../../../site/schemas/create-disruption.schema";

// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(customParseFormat);

const convertDateTimeToFormat = (dateOrTime: string | Date) => {
    return dayjs(dateOrTime).format("DD/MM/YYYY");
};

const [stageName, itemsToCreate] = process.argv.slice(2);

if (!stageName) {
    console.log("Please provide Serverless Stack Stage name.");
    process.exit(0);
}

const getRandomDate = () => {
    const start = new Date(2022, 0, 1);
    const end = new Date(2025, 0, 1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getDateAWeekLater = (date: Date): Date => {
    return new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
};

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const tableName = `cdd-disruptions-table-${stageName}`;

const requests = [];

for (let i = 0; i < Number(itemsToCreate); i++) {
    const validityPeriods: Validity[] = [];
    let summary = "";
    let consequences = baseConsequences;
    const disruptionId = randomUUID();

    if (!consequences) {
        throw new Error("Base Consequence not found.");
    }

    if (i % 2 === 0) {
        validityPeriods.push({
            disruptionStartDate: convertDateTimeToFormat(getRandomDate()),
            disruptionStartTime: "1200",
        });
        consequences = [
            {
                ...consequences[0],
                disruptionSeverity: Severity.verySevere,
                vehicleMode: VehicleMode.tram,
            },
        ];
        summary =
            "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be weak to bus information.";
    } else if (i % 3 === 0) {
        const randomDate = getRandomDate();
        validityPeriods.push(
            { disruptionStartDate: convertDateTimeToFormat(getRandomDate()), disruptionStartTime: "1200" },
            {
                disruptionStartDate: convertDateTimeToFormat(randomDate),
                disruptionStartTime: "1100",
                disruptionEndDate: convertDateTimeToFormat(getDateAWeekLater(randomDate)),
                disruptionEndTime: "1400",
            },
        );
        consequences = [
            {
                ...consequences[0],
                disruptionSeverity: Severity.unknown,
                vehicleMode: VehicleMode.rail,
            },
        ];
        summary = "Apes loose from zoo";
    } else if (i % 5 === 0) {
        const randomDateOne = getRandomDate();
        const randomDateTwo = getRandomDate();
        validityPeriods.push(
            {
                disruptionStartDate: convertDateTimeToFormat(randomDateOne),
                disruptionStartTime: "1200",
                disruptionEndDate: convertDateTimeToFormat(getDateAWeekLater(randomDateOne)),
                disruptionEndTime: "1400",
            },
            {
                disruptionStartDate: convertDateTimeToFormat(randomDateTwo),
                disruptionStartTime: "1200",
                disruptionEndDate: convertDateTimeToFormat(getDateAWeekLater(randomDateOne)),
                disruptionEndTime: "1400",
            },
        );
        consequences = [
            {
                ...consequences[0],
                disruptionSeverity: Severity.unknown,
                vehicleMode: VehicleMode.rail,
            },
        ];
        summary = "Bus drivers on strike (due to being unhappy about Alien invasions and road closures).";
    } else if (i % 7 === 0) {
        const randomDateOne = getRandomDate();
        const randomDateTwo = getRandomDate();
        const randomDateThree = getRandomDate();
        validityPeriods.push(
            {
                disruptionStartDate: convertDateTimeToFormat(randomDateOne),
                disruptionStartTime: "1200",
                disruptionEndDate: convertDateTimeToFormat(getDateAWeekLater(randomDateOne)),
                disruptionEndTime: "1400",
            },
            {
                disruptionStartDate: convertDateTimeToFormat(randomDateTwo),
                disruptionStartTime: "1200",
                disruptionEndDate: convertDateTimeToFormat(getDateAWeekLater(randomDateOne)),
                disruptionEndTime: "1400",
            },
            { disruptionStartDate: convertDateTimeToFormat(randomDateThree), disruptionStartTime: "1200" },
        );
        summary = "Busted reunion traffic";
        consequences = [
            {
                ...consequences[0],
                disruptionSeverity: Severity.severe,
                vehicleMode: VehicleMode.rail,
            },
            {
                ...consequences[0],
                disruptionSeverity: Severity.slight,
                vehicleMode: VehicleMode.ferryService,
            },
            {
                ...consequences[0],
                disruptionSeverity: Severity.verySevere,
                vehicleMode: VehicleMode.tram,
            },
        ];
    } else {
        const randomDate = getRandomDate();
        validityPeriods.push({
            disruptionStartDate: convertDateTimeToFormat(randomDate),
            disruptionStartTime: "1200",
            disruptionEndDate: convertDateTimeToFormat(getDateAWeekLater(randomDate)),
            disruptionEndTime: "1400",
        });
        summary = "Mongeese loose from petting zoo";
    }

    const disruption: DisruptionInfo = {
        ...baseSiteDisruptionInfo,
        validity: validityPeriods,
        summary,
        disruptionId,
    };

    requests.push({
        PutRequest: {
            Item: {
                PK: "1",
                SK: `${disruptionId}#INFO`,
                publishStatus: "PUBLISHED",
                ...disruption,
            },
        },
    });

    consequences.forEach((consequence, index) => {
        requests.push({
            PutRequest: {
                Item: {
                    PK: "1",
                    SK: `${disruptionId}#CONSEQUENCE#${index}`,
                    publishStatus: "PUBLISHED",
                    ...consequence,
                    disruptionId,
                },
            },
        });
    });
}
const promises = [];
const chunkSize = 25;

for (let i = 0; i < requests.length; i += chunkSize) {
    const chunk = requests.slice(i, i + chunkSize);

    const params = {
        RequestItems: {
            [tableName]: chunk,
        },
    };

    promises.push(ddbDocClient.send(new BatchWriteCommand(params)));
}

Promise.all(promises)
    .then()
    .catch((e) => console.error(e));
