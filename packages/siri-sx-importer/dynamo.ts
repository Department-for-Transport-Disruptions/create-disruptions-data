import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { Consequence, DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
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


const isConsequenceInfo = (item: Consequence | DisruptionInfo): item is Consequence =>
    (item as Consequence).consequenceIndex !== undefined && (item as Consequence).consequenceIndex !== null;

const createBatches = (items: (Consequence| DisruptionInfo)[], size = 50) =>
    Array.from({ length: Math.ceil(items.length / size) }, (v, i) => items.slice(i * size, i * size + size));

export const publishDisruptionAndConsequenceInfoToDynamo = (disruptionInfo: DisruptionInfo[], consequenceInfo: Consequence[], tableName: string) => {
    const mergedItems = [...disruptionInfo, ...consequenceInfo];
    const batches = mergedItems.length > 50 ? createBatches(mergedItems) : [mergedItems];


    batches.forEach((batch) => {
        const disruptionsPutCommand = batch.map((item) => {
             if (isConsequenceInfo(item)) {
                return {
                    Put: {
                        TableName: tableName,
                        Item: {
                            PK: item.orgId,
                            SK: `${item.disruptionId}#CONSEQUENCE#${item.consequenceIndex}`,
                            publishStatus: "PUBLISHED",
                            ...item,
                        },
                    },
                };
            }

            return {
                Put: {
                    TableName: tableName,
                    Item: {
                        PK: item.orgId,
                        SK: `${item.disruptionId}#INFO`,
                        publishStatus: "PUBLISHED",
                        ...item,
                    },
                },
            };
        })
        ddbDocClient
            .send(
                new TransactWriteCommand({
                    TransactItems: [...disruptionsPutCommand],
                }),
            )
            // eslint-disable-next-line no-console
            .catch((e) => console.error(e));
    })
};
