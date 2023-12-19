import fetch from "node-fetch";
import { serviceWithCentrePointSchema } from "../disruptionTypes";
import { Datasource } from "../enums";
import { Logger } from ".";

export const fetchService = async (serviceRef: string, nocCode: string, dataSource: Datasource, logger: Logger) => {
    logger.debug(`Retrieving routes for service: ${serviceRef}, using dataSource: ${dataSource}`);

    if (!process.env.API_BASE_URL) {
        logger.error("Reference data service URL is not set as an environment variable");
        throw Error;
    }
    const searchApiUrl = `${process.env.API_BASE_URL}/operators/${nocCode}/services/${serviceRef}?dataSource=${dataSource}`;
    const res = await fetch(searchApiUrl, {
        method: "GET",
    });

    const parseResult = serviceWithCentrePointSchema.safeParse(await res.json());

    if (!parseResult.success) {
        return null;
    }

    return parseResult.data;
};
