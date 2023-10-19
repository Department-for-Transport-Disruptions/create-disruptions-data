import fetch from "node-fetch";
import { routesSchema } from "../disruptionTypes";
import { Logger } from ".";

export const fetchServiceRoutes = async (serviceId: number, logger: Logger) => {
    logger.debug(`Retrieving routes for service: ${serviceId}`);

    if (!process.env.API_BASE_URL) {
        logger.error("Reference data service URL is not set as an environment variable");
        throw Error;
    }
    const searchApiUrl = `${process.env.API_BASE_URL}/services/${serviceId}/routes`;

    const res = await fetch(searchApiUrl, {
        method: "GET",
    });

    const parseResult = routesSchema.safeParse(await res.json());

    if (!parseResult.success) {
        return null;
    }

    return parseResult.data;
};
