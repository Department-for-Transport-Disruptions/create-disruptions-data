import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { getLiveDisruptions } from "@create-disruptions-data/shared-ts/utils/db";
import { getOrganisationsInfo } from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as logger from "lambda-log";
import { SiriStats, generateSiriStats } from "./utils/statGenerators";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const publishStatsToDynamo = async (
    orgTableName: string,
    siriStats: Record<string, SiriStats>,
    cancelFeatureFlag: boolean,
) => {
    try {
        const orgList = await getOrganisationsInfo(orgTableName, logger);
        if (orgList) {
            const orgPutRequest = orgList.map((org) => {
                const orgId = org.id;
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
                                  totalDisruptionsCount: statForOrg.totalDisruptionsCount,
                                  lastUpdated: statForOrg.lastUpdated,
                                  ...(cancelFeatureFlag
                                      ? {
                                            journeysConsequencesCount: statForOrg.journeysConsequencesCount,
                                            journeysAffected: statForOrg.journeysAffected,
                                        }
                                      : {}),
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
                                  totalDisruptionsCount: 0,
                                  lastUpdated: "",
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

        const {
            DISRUPTIONS_TABLE_NAME: disruptionsTableName,
            ORGANISATIONS_TABLE_NAME: orgTableName,
            STAGE: stage,
        } = process.env;
        const ENABLE_CANCELLATION_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");

        if (!disruptionsTableName || !orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        const disruptions = await getLiveDisruptions();

        const siriStats = generateSiriStats(disruptions, ENABLE_CANCELLATION_FEATURE_FLAG);

        await publishStatsToDynamo(orgTableName, siriStats, ENABLE_CANCELLATION_FEATURE_FLAG);

        logger.info("Successfully published stats to DynamoDB...");
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
