import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import {
    getOrganisationsInfo,
    getPublishedDisruptionsDataFromDynamo,
} from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";
import { generateSiriStats, SiriStats } from "./utils/statGenerators";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const publishStatsToDynamo = async (orgTableName: string, siriStats: Record<string, SiriStats>) => {
    try {
        const orgList = await getOrganisationsInfo();
        if (!!orgList) {
            const orgPutRequest = orgList.map((org) => {
                const orgId = org.PK;
                const statForOrg = siriStats[orgId];

                return statForOrg
                    ? {
                          Put: {
                              TableName: orgTableName,
                              Item: {
                                  PK: orgId,
                                  SK: "STAT",
                                  servicesConsequencesCount: statForOrg.servicesConsequencesCount,
                                  servicesAffected: statForOrg.servicesAffected,
                                  stopsConsequencesCount: statForOrg.stopsConsequencesCount,
                                  stopsAffected: statForOrg.stopsAffected,
                                  networkWideConsequencesCount: statForOrg.networkWideConsequencesCount,
                                  operatorWideConsequencesCount: statForOrg.operatorWideConsequencesCount,
                                  totalConsequencesCount: statForOrg.totalConsequencesCount,
                                  disruptionReasonCount: statForOrg.disruptionReasonCount,
                              },
                          },
                      }
                    : {
                          Put: {
                              TableName: orgTableName,
                              Item: {
                                  PK: orgId,
                                  SK: "STAT",
                                  servicesConsequencesCount: 0,
                                  servicesAffected: 0,
                                  stopsConsequencesCount: 0,
                                  stopsAffected: 0,
                                  networkWideConsequencesCount: 0,
                                  operatorWideConsequencesCount: 0,
                                  totalConsequencesCount: 0,
                                  disruptionReasonCount: {},
                              },
                          },
                      };
            });

            await ddbDocClient.send(
                new TransactWriteCommand({
                    TransactItems: [...orgPutRequest],
                }),
            );
        }
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};

export const main = async (): Promise<void> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };
        logger.info("Starting SIRI-SX stats generator...");

        const { DISRUPTIONS_TABLE_NAME: disruptionsTableName, ORGANISATIONS_TABLE_NAME: orgTableName } = process.env;

        if (!disruptionsTableName || !orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        const disruptions = await getPublishedDisruptionsDataFromDynamo(disruptionsTableName);

        const siriStats = generateSiriStats(disruptions);

        await publishStatsToDynamo(orgTableName, siriStats);

        logger.info("Successfully published stats to DynamoDB...");
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
