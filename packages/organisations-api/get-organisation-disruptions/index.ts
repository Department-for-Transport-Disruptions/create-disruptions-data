import { Disruption, Service, ServiceGeoJSON, Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { getActiveDisruptions } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { fetchService } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const fetchRoute = (routesData: Partial<Stop>[]) => {
    const routes =
        routesData.map((route) => (route.latitude && route.longitude ? [route.longitude, route.latitude] : [])) ?? [];

    return routes;
};

const getMapData = (stops: Stop[], uniqueStopIds: Set<string>) => {
    return stops
        .map((stop) => {
            if (!uniqueStopIds.has(stop.atcoCode)) {
                uniqueStopIds.add(stop.atcoCode);
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [stop.longitude, stop.latitude],
                    },
                    properties: {
                        atco_code: stop.atcoCode,
                        common_name: stop.commonName,
                    },
                };
            } else {
                return null;
            }
        })
        .filter((data) => data);
};

const getGeoJson = (coordinates: number[][], service: Service) => {
    return {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: coordinates,
        },
        properties: {
            service_line_id: service.lineId,
            destination: service.destination,
            origin: service.origin,
            service_line_name: service.lineName,
            service_noc_code: service.nocCode,
            service_operator: service.operatorShortName,
            service_code: service.serviceCode,
        },
    };
};

const getStopsFromDisruptions = (disruptions: Disruption[]) => {
    const uniqueStopIds = new Set<string>();
    return disruptions.flatMap((disruption) =>
        (disruption.consequences || []).flatMap((consequence) =>
            (consequence.consequenceType === "stops" && consequence.stops) ||
            (consequence.consequenceType === "services" && consequence.stops)
                ? getMapData(consequence.stops, uniqueStopIds)
                : [],
        ),
    );
};

const getServicesFromDisruptions = (disruptions: Disruption[]) => {
    const uniqueServiceIds = new Set<string>();

    return disruptions.flatMap((disruption) =>
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
};

const getOrganisationDisruptions = async (orgId: string) => {
    try {
        const disruptionsTableName = process.env.DISRUPTIONS_TABLE_NAME as string;
        const disruptions = await getActiveDisruptions(disruptionsTableName, logger, orgId);

        const [stops, services] = await Promise.all([
            getStopsFromDisruptions(disruptions),
            getServicesFromDisruptions(disruptions),
        ]);

        const serviceCentrePoint = await Promise.all(
            services.map(async (service) => {
                const serviceInfo = await fetchService(
                    service.dataSource === Datasource.bods ? service.lineId : service.serviceCode,
                    service.nocCode,
                    service.dataSource,
                    logger,
                );

                return service.
            }),
        );
        const routesForMaps = await Promise.all(
            services.map(async (service) => {
                const routesData = await fetchService(
                    service.dataSource === Datasource.bods ? service.lineId : service.serviceCode,
                    service.dataSource,
                    logger,
                );

                const inboundRoute = fetchRoute(routesData?.inbound ?? []);
                const outboundRoute = fetchRoute(routesData?.outbound ?? []);

                const inboundGeoJSON: ServiceGeoJSON = getGeoJson(inboundRoute, service);
                const outboundGeoJSON: ServiceGeoJSON = getGeoJson(outboundRoute, service);

                return [inboundGeoJSON, outboundGeoJSON];
            }),
        );

        return { stops, services: routesForMaps.flat() };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(`Error occured while getting stops and services for an organisation: ${orgId} - error: `, e);

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

        const orgId = event?.pathParameters?.id;

        if (!orgId) {
            throw new Error("An organisation ID must be provided");
        }

        logger.info(`Retrieving disruptions data for orgId: (${orgId}) ...`);

        const disruptionsData = await getOrganisationDisruptions(orgId);

        console.log(disruptionsData);

        logger.info(`Successfully retrieved organisation: ${orgId}'s stops from DynamoDB...`);

        return {
            statusCode: 200,
            body: JSON.stringify(disruptionsData),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
