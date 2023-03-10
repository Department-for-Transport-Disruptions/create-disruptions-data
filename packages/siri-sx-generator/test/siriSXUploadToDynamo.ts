import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { testDisruptionsJson } from "./testData";
import { getDdbDocumentClient } from "../util/awsClient";

const [stageName] = process.argv.slice(2);

if (!stageName) {
    // eslint-disable-next-line no-console
    console.log("Please provide Serverless Stack Stage name.");
    process.exit(0);
}

const ddbDocClient = getDdbDocumentClient();

const promises = [];

for (const item of testDisruptionsJson) {
    const disruptionId = randomUUID();

    promises.push(
        ddbDocClient.send(
            new PutCommand({
                TableName: `cdd-disruptions-table-${stageName}`,
                Item: {
                    PK: "1",
                    SK: `1#${disruptionId}`,
                    ...item,
                },
            }),
        ),
    );
}

Promise.all(promises)
    .then()
    // eslint-disable-next-line no-console
    .catch((e) => console.error(e));
