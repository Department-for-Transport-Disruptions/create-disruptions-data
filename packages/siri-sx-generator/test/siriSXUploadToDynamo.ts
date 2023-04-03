/* eslint-disable no-console */
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { baseDisruptionJson } from "./testData";
import { getDdbDocumentClient } from "../util/awsClient";

const [stageName, itemsToCreate] = process.argv.slice(2);

if (!stageName) {
    console.log("Please provide Serverless Stack Stage name.");
    process.exit(0);
}

const ddbDocClient = getDdbDocumentClient();

const tableName = `cdd-disruptions-table-${stageName}`;

const requests = [];

const getRandomDate = () => {
    const start = new Date(2022, 0, 1);
    const end = new Date(2025, 0, 1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getDateAWeekLater = (date: Date): Date => {
    return new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
};

for (let i = 0; i < Number(itemsToCreate); i++) {
    const ValidityPeriod: { StartTime: string; EndTime?: string }[] = [];
    let Summary = "";

    if (i % 2 === 0) {
        ValidityPeriod.push({ StartTime: getRandomDate().toISOString() });
        Summary = "Alien attack";
    } else if (i % 3 === 0) {
        const randomDate = getRandomDate();
        ValidityPeriod.push(
            { StartTime: getRandomDate().toISOString() },
            { StartTime: randomDate.toISOString(), EndTime: getDateAWeekLater(randomDate).toISOString() },
        );
        Summary = "Apes loose from zoo";
    } else if (i % 5 === 0) {
        const randomDateOne = getRandomDate();
        const randomDateTwo = getRandomDate();
        ValidityPeriod.push(
            { StartTime: randomDateOne.toISOString(), EndTime: getDateAWeekLater(randomDateOne).toISOString() },
            { StartTime: randomDateTwo.toISOString(), EndTime: getDateAWeekLater(randomDateTwo).toISOString() },
        );
        Summary = "Bus drivers on strike";
    } else if (i % 7 === 0) {
        const randomDateOne = getRandomDate();
        const randomDateTwo = getRandomDate();
        const randomDateThree = getRandomDate();
        ValidityPeriod.push(
            { StartTime: randomDateOne.toISOString(), EndTime: getDateAWeekLater(randomDateOne).toISOString() },
            { StartTime: randomDateTwo.toISOString(), EndTime: getDateAWeekLater(randomDateTwo).toISOString() },
            { StartTime: randomDateThree.toISOString() },
        );
        Summary = "Busted reunion traffic";
    } else {
        const randomDate = getRandomDate();
        ValidityPeriod.push({
            StartTime: randomDate.toISOString(),
            EndTime: getDateAWeekLater(randomDate).toISOString(),
        });
        Summary = "Mongeese loose from petting zoo";
    }

    const json = {
        ...baseDisruptionJson,
        ValidityPeriod,
        SituationNumber: randomUUID(),
        Summary,
    };

    requests.push({
        PutRequest: {
            Item: {
                PK: "1",
                SK: randomUUID(),
                ...json,
            },
        },
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
