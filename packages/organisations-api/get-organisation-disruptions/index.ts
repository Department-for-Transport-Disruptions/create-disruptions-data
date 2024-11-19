import { randomUUID } from "crypto";
import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getLiveDisruptions } from "@create-disruptions-data/shared-ts/utils/db";
import { getServiceCentrePoint } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";

export const formatMapDisruptions = async (disruptions: Disruption[]) =>
    await Promise.all(
        disruptions.flatMap(async (disruption) => {
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
                }

                return [];
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
                                    latitude: serviceCentrePoint?.latitude ?? null,
                                    longitude: serviceCentrePoint?.longitude ?? null,
                                },
                            };
                        });
                    }
                    return [];
                }),
            );

            if ((!stops || stops.length === 0) && (!services || services.length === 0)) {
                return null;
            }

            return {
                id: disruption.id,
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

const getOrganisationDisruptions = async (orgId: string) => {
    try {
        const disruptions = await getLiveDisruptions(orgId);
        const mapDisruptions = (await formatMapDisruptions(disruptions)).filter(notEmpty);

        if (!disruptions) {
            return [];
        }

        return mapDisruptions;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(`Error occurred while retrieving map disruptions file for org: ${orgId} - error: `, e);
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
