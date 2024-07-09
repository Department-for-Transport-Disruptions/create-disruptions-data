import { randomUUID } from "crypto";
import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { getPublishedDisruptionById } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { getServiceCentrePoint } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";

const formatServiceConsequences = (consequences: Consequence[]) => {
    return Promise.all(
        consequences.flatMap(async (consequence) => {
            if (consequence.consequenceType === "services") {
                return {
                    ...consequence,
                    services: await Promise.all(
                        consequence.services.map(async (service) => {
                            const serviceCentrePoint = await getServiceCentrePoint(service);

                            return {
                                ...service,
                                coordinates: {
                                    latitude: serviceCentrePoint.latitude,
                                    longitude: serviceCentrePoint.longitude,
                                },
                            };
                        }),
                    ),
                };
            }

            return consequence;
        }),
    );
};

const getOrganisationDisruptionById = async (orgId: string, disruptionId: string) => {
    try {
        const disruptionsTableName = process.env.DISRUPTIONS_TABLE_NAME as string;

        const disruption = await getPublishedDisruptionById(orgId, disruptionId, disruptionsTableName, logger);

        if (!disruption) {
            logger.warn(`Disruption not found for disruption id: ${disruptionId} for organisation id: ${orgId}`);
            return null;
        }

        const consequencesWithServiceCentrePointIncluded = await formatServiceConsequences(
            disruption?.consequences ?? [],
        );

        const formattedDisruption = {
            ...disruption,
            consequences: consequencesWithServiceCentrePointIncluded,
        };

        return formattedDisruption;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(
                `Error occurred while getting disruption information for organisation: ${orgId}, disruption id: ${disruptionId} - error: `,
                e,
            );
        }

        throw e;
    }
};

export const main = async (event: APIGatewayEvent): Promise<{ statusCode: number; body: string }> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        const orgId = event?.pathParameters?.id;
        const disruptionId = event?.pathParameters?.disruptionId;

        if (!orgId) {
            throw new Error("An organisation ID must be provided");
        }

        if (!disruptionId) {
            throw new Error("A disruption ID must be provided");
        }

        logger.info(`Retrieving disruption data for orgId: (${orgId}), disruption id: (${disruptionId}) ...`);

        const disruptionData = await getOrganisationDisruptionById(orgId, disruptionId);

        if (!disruptionData) {
            return {
                statusCode: 404,
                body: "Disruption not found",
            };
        }

        logger.info(
            `Successfully retrieved disruption id: ${disruptionId} for organisation: ${orgId} from DynamoDB...`,
        );

        return {
            statusCode: 200,
            body: JSON.stringify(disruptionData),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);
        }

        throw e;
    }
};
