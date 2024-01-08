import fetch from "node-fetch";
import { ServiceWithCentrePoint, serviceWithCentrePointSchema } from "../disruptionTypes";
import { Datasource } from "../enums";
import { Logger } from ".";

export const fetchService = async (
    serviceRef: string,
    nocCode: string,
    dataSource: Datasource,
    logger: Logger,
): Promise<ServiceWithCentrePoint | null> => {
    try {
        logger.debug(`Retrieving service: ${serviceRef}, using dataSource: ${dataSource}`);

        if (!process.env.API_BASE_URL) {
            logger.error("Reference data service URL is not set as an environment variable");
            throw Error;
        }
        const searchApiUrl = `${process.env.API_BASE_URL}/operators/${nocCode}/services/${serviceRef}?dataSource=${dataSource}`;
        const res = await fetch(searchApiUrl, {
            method: "GET",
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch services with response code: ${res.status}`);
        }

        const parseResult = serviceWithCentrePointSchema.safeParse(await res.json());

        if (!parseResult.success) {
            return null;
        }

        return parseResult.data;
    } catch (e) {
        if (e instanceof Error) {
            logger.warn(
                `Error fetching service: ${serviceRef} for operator: ${nocCode} with dataSource: ${dataSource}`,
            );

            logger.warn(e.stack || e.message);
        }

        return null;
    }
};
