import * as logger from "lambda-log";
import fetch from "node-fetch";
import { z } from "zod";
import { serviceWithCentrePointSchema } from "../disruptionTypes";
import { Datasource } from "../enums";
import { roadwork } from "../roadwork.zod";
export const fetchService = async (serviceRef, nocCode, dataSource, logger) => {
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
    }
    catch (e) {
        if (e instanceof Error) {
            logger.warn(`Error fetching service: ${serviceRef} for operator: ${nocCode} with dataSource: ${dataSource}`);
            logger.warn(e.stack || e.message);
        }
        return null;
    }
};
export const getServiceCentrePoint = async (service) => {
    const serviceInfo = await fetchService(service.dataSource === Datasource.bods ? service.lineId : service.serviceCode, service.nocCode, service.dataSource, logger);
    return { latitude: serviceInfo?.centrePointLat ?? null, longitude: serviceInfo?.centrePointLon ?? null };
};
export const getRecentlyCancelledRoadworks = async () => {
    try {
        const searchApiUrl = `${process.env.API_BASE_URL}/roadworks?permitStatus=cancelled&lastUpdatedTimeDelta=5`;
        const res = await fetch(searchApiUrl, {
            method: "GET",
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch roadworks cancelled in the last 5 minutes with response code: ${res.status}`);
        }
        const parseResult = z.array(roadwork).safeParse(await res.json());
        if (!parseResult.success) {
            return null;
        }
        return parseResult.data;
    }
    catch (e) {
        if (e instanceof Error) {
            logger.warn("Error fetching recently cancelled roadworks");
            logger.warn(e.stack || e.message);
        }
        return null;
    }
};
export const getRecentlyNewRoadworks = async () => {
    try {
        // 1440 minutes in 24 hours
        const searchApiUrl = `${process.env.API_BASE_URL}/roadworks?createdTimeDelta=1440`;
        const res = await fetch(searchApiUrl, {
            method: "GET",
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch new roadworks in the last 24 hours with response code: ${res.status}`);
        }
        const parseResult = z.array(roadwork).safeParse(await res.json());
        if (!parseResult.success) {
            return null;
        }
        return parseResult.data;
    }
    catch (e) {
        if (e instanceof Error) {
            logger.warn("Error fetching recently new roadworks");
            logger.warn(e.stack || e.message);
        }
        return null;
    }
};
const adminAreaSchema = z.object({
    administrativeAreaCode: z.string(),
    name: z.string(),
    shortName: z.string(),
});
export const fetchAdminAreas = async () => {
    const searchApiUrl = `${process.env.API_BASE_URL}/admin-areas`;
    const res = await fetch(searchApiUrl, {
        method: "GET",
    });
    const parseResult = z.array(adminAreaSchema).safeParse(await res.json());
    if (!parseResult.success) {
        return [];
    }
    return parseResult.data;
};
