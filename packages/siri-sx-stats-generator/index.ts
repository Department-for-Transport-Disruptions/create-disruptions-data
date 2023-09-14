import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import {
    getOrganisationsInfo,
    getPublishedDisruptionsDataFromDynamo,
} from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";
import {
    Disruption,
    generateConsequenceStats,
    generateReasonCountStats,
    initialConsequenceStatsValues,
    initialDisruptionReasonCount,
    SiriStats,
} from "./utils/statGenerators";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

export const generateSiriStats = (disruptions: Disruption[]) => {
    return disruptions.reduce((acc: Record<string, SiriStats>, disruption) => {
        const key = disruption.orgId ? disruption.orgId : "";
        const consequenceStats = generateConsequenceStats(key, disruption);
        if (consequenceStats) {
            if (!acc.hasOwnProperty(key)) {
                acc[key] = {
                    disruptionReasonCount: { ...initialDisruptionReasonCount },
                    ...initialConsequenceStatsValues,
                };
            }
            acc[key] = {
                disruptionReasonCount: generateReasonCountStats(
                    disruption.disruptionReason,
                    acc[key].disruptionReasonCount,
                ),
                servicesConsequencesCount:
                    acc[key].servicesConsequencesCount + consequenceStats[key].servicesConsequencesCount,
                servicesAffected: acc[key].servicesAffected + consequenceStats[key].servicesAffected,
                stopsConsequencesCount: acc[key].stopsConsequencesCount + consequenceStats[key].stopsConsequencesCount,
                stopsAffected: acc[key].stopsAffected + consequenceStats[key].stopsAffected,
                networkWideConsequencesCount:
                    acc[key].networkWideConsequencesCount + consequenceStats[key].networkWideConsequencesCount,
                operatorWideConsequencesCount:
                    acc[key].operatorWideConsequencesCount + consequenceStats[key].operatorWideConsequencesCount,
                totalConsequencesCount: acc[key].totalConsequencesCount + consequenceStats[key].totalConsequencesCount,
            };
        }
        return acc;
    }, {});
};

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
