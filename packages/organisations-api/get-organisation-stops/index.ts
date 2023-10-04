import { Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    getImpactedServicesInOrganisation,
    getImpactedStopsInOrganisation,
} from "@create-disruptions-data/shared-ts/utils/dynamo";
import { fetchServiceRoutes } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const fetchRoute = (routesData: Partial<Stop>[]) => {
    const routes =
        routesData.map((route) => (route.latitude && route.longitude ? [route.latitude, route.longitude] : [])) ?? [];

    return routes;
};

const getOrganisationStops = async (orgId: string) => {
    try {
        const [orgList, servicesList] = await Promise.all([
            getImpactedStopsInOrganisation(orgId, logger),
            getImpactedServicesInOrganisation(orgId, logger),
        ]);

        const routesForMaps: number[][][] = [];
        await Promise.all(
            servicesList.map(async (service) => {
                const routesData = await fetchServiceRoutes(service.id, logger);

                const [inboundRoute, outboundRoute] = await Promise.all([
                    fetchRoute(routesData?.inbound ?? []),
                    fetchRoute(routesData?.outbound ?? []),
                ]);

                routesForMaps.push(inboundRoute);
                routesForMaps.push(outboundRoute);
            }),
        );

        return { stops: orgList, services: routesForMaps };
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
