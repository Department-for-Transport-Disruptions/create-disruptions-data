/* eslint-disable no-console */
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { baseDisruptionJson } from "./testData";
import { getDdbDocumentClient } from "../util/awsClient";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { Severity, VehicleMode, Progress } from "@create-disruptions-data/shared-ts/enums";

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
    let consequences = baseDisruptionJson.Consequences?.Consequence;
    let progress = Progress.open;

    if (!consequences) {
        throw new Error("Base Consequence not found.");
    }

    if (i % 2 === 0) {
        ValidityPeriod.push({ StartTime: getRandomDate().toISOString() });
        consequences = [
            {
                ...consequences[0],
                Severity: Severity.verySevere,
                Affects: {
                    Networks: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode.tram,
                            AllLines: "",
                        },
                    },
                },
            },
        ];
        Summary =
            "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be weak to bus information.";
    } else if (i % 3 === 0) {
        const randomDate = getRandomDate();
        ValidityPeriod.push(
            { StartTime: getRandomDate().toISOString() },
            { StartTime: randomDate.toISOString(), EndTime: getDateAWeekLater(randomDate).toISOString() },
        );
        consequences = [
            {
                ...consequences[0],
                Severity: Severity.unknown,
                Affects: {
                    Networks: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode.rail,
                            AllLines: "",
                        },
                    },
                },
            },
        ];
        Summary = "Apes loose from zoo";
        progress = Progress.published;
    } else if (i % 5 === 0) {
        const randomDateOne = getRandomDate();
        const randomDateTwo = getRandomDate();
        ValidityPeriod.push(
            { StartTime: randomDateOne.toISOString(), EndTime: getDateAWeekLater(randomDateOne).toISOString() },
            { StartTime: randomDateTwo.toISOString(), EndTime: getDateAWeekLater(randomDateTwo).toISOString() },
        );
        consequences = [
            {
                ...consequences[0],
                Severity: Severity.unknown,
                Affects: {
                    Networks: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode.rail,
                            AllLines: "",
                        },
                    },
                },
            },
        ];
        Summary = "Bus drivers on strike (due to being unhappy about Alien invasions and road closures).";
        progress = Progress.closed;
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
        progress = Progress.approvedDraft;
        consequences = [
            {
                ...consequences[0],
                Severity: Severity.severe,
                Affects: {
                    Networks: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode.rail,
                            AllLines: "",
                        },
                    },
                },
            },
            {
                ...consequences[0],
                Severity: Severity.slight,
                Affects: {
                    Networks: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode.ferryService,
                            AllLines: "",
                        },
                    },
                },
            },
            {
                ...consequences[0],
                Severity: Severity.verySevere,
                Affects: {
                    Networks: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode.tram,
                            AllLines: "",
                        },
                    },
                },
            },
        ];
    } else {
        const randomDate = getRandomDate();
        ValidityPeriod.push({
            StartTime: randomDate.toISOString(),
            EndTime: getDateAWeekLater(randomDate).toISOString(),
        });
        Summary = "Mongeese loose from petting zoo";
        progress = Progress.draft;
    }

    const json: PtSituationElement = {
        ...baseDisruptionJson,
        ValidityPeriod,
        SituationNumber: randomUUID(),
        Summary,
        Consequences: {
            Consequence: consequences,
        },
        Progress: progress,
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
