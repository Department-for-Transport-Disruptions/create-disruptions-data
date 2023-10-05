import { Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { getDate, getFormattedDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { getPublishedDisruptionsDataFromDynamo } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { fetchServiceRoutes } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { APIGatewayEvent } from "aws-lambda";
import { Dayjs } from "dayjs";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const fetchRoute = (routesData: Partial<Stop>[]) => {
    const routes =
        routesData.map((route) => (route.latitude && route.longitude ? [route.latitude, route.longitude] : [])) ?? [];

    return routes;
};

const getMapData = (stops: Stop[], uniqueStopIds: Set<string>) => {
    return stops
        .map((stop) => {
            if (!uniqueStopIds.has(stop.atcoCode)) {
                uniqueStopIds.add(stop.atcoCode);
                return [stop.latitude, stop.longitude];
            } else {
                return null;
            }
        })
        .filter((data) => data);
};

const getOrganisationStops = async (orgId: string) => {
    try {
        const disruptionsTableName = process.env.DISRUPTIONS_TABLE_NAME as string;
        const disruptions = await getPublishedDisruptionsDataFromDynamo(disruptionsTableName, logger, orgId);

        const uniqueStopIds = new Set<string>();
        const uniqueServiceIds = new Set<string>();

        const activeAndPublishedDisruptions = disruptions.filter((disruption) => {
            const currentDate = getDate();
            const startDate = getFormattedDate(disruption.disruptionStartDate);

            const mergedValidities = disruption.validity;
            mergedValidities?.push({
                disruptionStartDate: disruption.disruptionStartDate,
                disruptionStartTime: disruption.disruptionStartTime,
                disruptionEndDate: disruption.disruptionEndDate,
                disruptionEndTime: disruption.disruptionEndTime,
                disruptionNoEndDateTime: disruption.disruptionNoEndDateTime,
                disruptionRepeats: disruption.disruptionRepeats,
                disruptionRepeatsEndDate: disruption.disruptionRepeatsEndDate,
            });

            let maxEndDate: Dayjs | undefined = undefined;

            mergedValidities?.map((validity) => {
                const endDate = validity.disruptionRepeatsEndDate
                    ? getFormattedDate(validity.disruptionRepeatsEndDate)
                    : validity.disruptionEndDate
                    ? getFormattedDate(validity.disruptionEndDate)
                    : undefined;

                if (!maxEndDate) maxEndDate = endDate;

                if (endDate && endDate.isAfter(maxEndDate)) {
                    maxEndDate = endDate;
                }
            });

            return startDate.isSameOrBefore(currentDate) && (maxEndDate ? currentDate.isBefore(maxEndDate) : true);
        });

        const stops = activeAndPublishedDisruptions.flatMap((disruption) =>
            (disruption.consequences || []).flatMap((consequence) =>
                (consequence.consequenceType === "stops" && consequence.stops) ||
                (consequence.consequenceType === "services" && consequence.stops)
                    ? getMapData(consequence.stops, uniqueStopIds)
                    : [],
            ),
        );

        const services = activeAndPublishedDisruptions.flatMap((disruption) =>
            (disruption.consequences || []).flatMap((consequence) =>
                consequence.consequenceType === "services"
                    ? consequence.services.filter((service) => {
                          if (!uniqueServiceIds.has(service.lineId)) {
                              uniqueServiceIds.add(service.lineId);
                              return true;
                          }
                          return false;
                      })
                    : [],
            ),
        );

        const routesForMaps: number[][][] = [];
        await Promise.all(
            services.map(async (service) => {
                const routesData = await fetchServiceRoutes(service.id, logger);

                const [inboundRoute, outboundRoute] = await Promise.all([
                    fetchRoute(routesData?.inbound ?? []),
                    fetchRoute(routesData?.outbound ?? []),
                ]);

                routesForMaps.push(inboundRoute);
                routesForMaps.push(outboundRoute);
            }),
        );

        return { stops, services: routesForMaps };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
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
        logger.info("Starting get organisation stops data...");

        const { ORGANISATIONS_TABLE_NAME: orgTableName } = process.env;

        if (!orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        const orgId = event?.pathParameters?.id;

        if (!orgId) {
            throw new Error("An organisation ID must be provided");
        }

        const stopsAndServicesMapData = await getOrganisationStops(orgId);

        logger.info("Successfully retrieved organisations DynamoDB...");

        return {
            statusCode: 200,
            body: JSON.stringify(stopsAndServicesMapData),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
