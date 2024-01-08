import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getActiveDisruptions } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { getServiceCentrePoint } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const getOrganisationDisruptions = async (orgId: string) => {
    try {
        const disruptionsTableName = process.env.DISRUPTIONS_TABLE_NAME as string;
        const activeDisruptions = await getActiveDisruptions(disruptionsTableName, logger, orgId);

        const disruptionsFormattedForMap = await Promise.all(
            activeDisruptions.flatMap(async (disruption) => {
                if (!disruption.consequences || disruption.consequences.length === 0) {
                    return null;
                }

                const stops = disruption.consequences.flatMap((consequence) => {
                    if (consequence.consequenceType === "stops") {
                        return consequence.stops.map((stop) => ({
                            atcoCode: stop.atcoCode,
                            commonName: stop.commonName,
                            bearing: stop.bearing,
                            coordinates: { latitude: stop.latitude, longitude: stop.longitude },
                        }));
                    } else return [];
                });

                const services = await Promise.all(
                    disruption.consequences.flatMap((consequence) => {
                        if (consequence.consequenceType === "services") {
                            return consequence.services.map(async (service) => {
                                const serviceCentrePoint = await getServiceCentrePoint(service);

                                return {
                                    lineName: service.lineName,
                                    destination: service.destination,
                                    origin: service.origin,
                                    nocCode: service.nocCode,
                                    operatorName: service.operatorShortName,
                                    coordinates: {
                                        latitude: serviceCentrePoint.latitude,
                                        longitude: serviceCentrePoint.longitude,
                                    },
                                };
                            });
                        } else return [];
                    }),
                );

                if ((!stops || stops.length === 0) && (!services || services.length === 0)) {
                    return null;
                }

                return {
                    disruptionId: disruption.disruptionId,
                    disruptionReason: disruption.disruptionReason,
                    disruptionStartDate: disruption.disruptionStartDate,
                    disruptionStartTime: disruption.disruptionStartTime,
                    disruptionEndDate: disruption.disruptionEndDate,
                    disruptionEndTime: disruption.disruptionEndTime,
                    disruptionNoEndDateTime: disruption.disruptionNoEndDateTime,
                    stops: stops,
                    services: services,
                };
            }),
        );

        return disruptionsFormattedForMap.filter(notEmpty);
    } catch (e) {
        if (e instanceof Error) {
            logger.error(`Error occurred while getting stops and services for an organisation: ${orgId} - error: `, e);
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

        if (!orgId) {
            throw new Error("An organisation ID must be provided");
        }

        logger.info(`Retrieving disruptions data for orgId: (${orgId}) ...`);

        const disruptionsData = await getOrganisationDisruptions(orgId);

        logger.info(`Successfully retrieved organisation: ${orgId}'s stops from DynamoDB...`);

        return {
            statusCode: 200,
            body: JSON.stringify(disruptionsData),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);
        }

        throw e;
    }
};
