import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { Consequence, DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { disruption } from "@create-disruptions-data/siri-sx-generator/test/testData";
import * as console from "console";
import { Organisation, organisationSchema } from "./utils/importerSiriTypes.zod";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

export const getOrgIdFromDynamo = async (participantRef: string, tableName: string): Promise<string> => {
    const dbData = await ddbDocClient.send(
        new ScanCommand({
            TableName: tableName,
        }),
    );

    const parsedOrg = organisationSchema.parse(dbData.Items);

    const filteredOrg: Organisation = parsedOrg.filter((item) => item.name === participantRef);

    return !!filteredOrg ? filteredOrg[0].PK : "";
};

// TODO Deanna turn me into a generic
const createConsequenceBatches = (items: Consequence[], size = 50) =>
    Array.from({ length: Math.ceil(items.length / size) }, (v, i) => items.slice(i * size, i * size + size));

const createDisruptionInfoBatches = (items: DisruptionInfo[], size = 50) =>
    Array.from({ length: Math.ceil(items.length / size) }, (v, i) => items.slice(i * size, i * size + size));

export const publishDisruptionInfoToDynamo = (disruptionInfo: DisruptionInfo[], tableName: string) => {
    const batches = disruptionInfo.length > 50 ? createDisruptionInfoBatches(disruptionInfo) : [disruptionInfo];

    batches.forEach((batch) => {
        const disruptionsPutCommand = batch.map((disruption) => {
            return {
                Put: {
                    TableName: tableName,
                    Item: {
                        PK: disruption.orgId,
                        SK: `${disruption.disruptionId}#INFO`,
                        publishStatus: "PUBLISHED",
                        ...disruption,
                    },
                },
            };
        });

        ddbDocClient
            .send(
                new TransactWriteCommand({
                    TransactItems: [...disruptionsPutCommand],
                }),
            )
            // eslint-disable-next-line no-console
            .catch((e) => console.error(e));
    });
};

export const publishConsequenceInfoToDynamo = (consequenceInfo: Consequence[], tableName: string) => {
    const batches = consequenceInfo.length > 50 ? createConsequenceBatches(consequenceInfo) : [consequenceInfo];

    batches.forEach((batch) => {
        const consequencePutCommand = batch.map((consequence) => {
            return {
                Put: {
                    TableName: tableName,
                    Item: {
                        PK: consequence.orgId,
                        SK: `${consequence.disruptionId}#CONSEQUENCE#${consequence.consequenceIndex}`,
                        publishStatus: "PUBLISHED",
                        ...consequence,
                    },
                },
            };
        });

        ddbDocClient
            .send(
                new TransactWriteCommand({
                    TransactItems: [...consequencePutCommand],
                }),
            )
            // eslint-disable-next-line no-console
            .catch((e) => console.error(e));
    });
};
