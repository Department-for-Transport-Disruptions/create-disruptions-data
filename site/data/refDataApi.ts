import { Datasource, Modes } from "@create-disruptions-data/shared-ts/enums";
import { Position } from "geojson";
import { z } from "zod";
import { API_BASE_URL } from "../constants";
import { LargePolygonError } from "../errors";
import {
    operatorSchema,
    routesSchema,
    serviceByStopSchema,
    serviceApiResponseSchema,
    stopSchema,
} from "../schemas/consequence.schema";
import { makeFilteredArraySchema } from "../utils";

interface FetchStopsInput {
    adminAreaCodes: string[];
    polygon?: Position[];
    searchString?: string;
    stopTypes?: string[];
    busStopType?: string;
}

export const fetchStops = async (input: FetchStopsInput) => {
    const searchApiUrl = `${API_BASE_URL}/stops`;

    const queryStringItems = [`adminAreaCodes=${input.adminAreaCodes.join(",")}`];

    if (input.polygon) {
        queryStringItems.push(`polygon=${JSON.stringify(input.polygon)}`);
    }

    if (input.searchString) {
        queryStringItems.push(`search=${input.searchString}`);
    }

    if (input.stopTypes) {
        queryStringItems.push(`stopTypes=${input.stopTypes.join(",")}`);
    }
    if (input.busStopType) {
        queryStringItems.push(`busStopType=${input.busStopType}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    if (!res.ok) {
        const body = (await res.json()) as { error: string };
        if (body.error.includes("Area of polygon must be below")) {
            throw new LargePolygonError();
        }

        throw new Error(`fetchStops call failed: ${body.error}`);
    }

    const parseResult = makeFilteredArraySchema(stopSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }
    return parseResult.data;
};

interface FetchServicesInput {
    adminAreaCodes?: string[];
    dataSource?: Datasource;
    modes?: Modes[];
}

export const fetchServices = async (input: FetchServicesInput) => {
    const searchApiUrl = `${API_BASE_URL}/services`;

    const queryStringItems = [];

    if (input.adminAreaCodes && input.adminAreaCodes.length > 0) {
        queryStringItems.push(`adminAreaCodes=${input.adminAreaCodes.join(",")}`);
    }

    if (input.dataSource) {
        queryStringItems.push(`dataSource=${input.dataSource}`);
    }

    if (input.modes && input.modes.length > 0) {
        queryStringItems.push(`modes=${input.modes.join(",")}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = makeFilteredArraySchema(serviceApiResponseSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchServicesByStopsInput {
    atcoCodes?: string[];
    includeRoutes?: boolean;
    dataSource?: Datasource;
}

export const fetchServicesByStops = async (input: FetchServicesByStopsInput) => {
    const searchApiUrl = `${API_BASE_URL}/services`;

    const queryStringItems = [];

    if (input.atcoCodes) {
        queryStringItems.push(`atcoCodes=${input.atcoCodes.join(",")}`);
    }

    if (input.includeRoutes) {
        queryStringItems.push("includeRoutes=true");
    }

    if (input.dataSource) {
        queryStringItems.push(`dataSource=${input.dataSource}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = makeFilteredArraySchema(serviceByStopSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchServiceRoutes {
    serviceId: number;
    busStopType?: string;
    modes?: string;
    stopTypes?: string;
    dataSource?: string;
}

export const fetchServiceRoutes = async (input: FetchServiceRoutes) => {
    const searchApiUrl = `${API_BASE_URL}/services/${input.serviceId}/routes`;

    const queryStringItems = [];

    if (input.modes) {
        queryStringItems.push(`modes=${input.modes}`);
    }

    if (input.busStopType) {
        queryStringItems.push(`busStopType=${input.busStopType}`);
    }

    if (input.stopTypes) {
        queryStringItems.push(`stopTypes=${input.stopTypes}`);
    }

    if (input.dataSource) {
        queryStringItems.push(`dataSource=${input.dataSource}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = routesSchema.safeParse(await res.json());

    if (!parseResult.success) {
        return null;
    }

    return parseResult.data;
};

interface FetchServiceStops {
    serviceId: number;
    busStopType?: string;
    modes?: string;
    stopTypes?: string;
    dataSource?: Datasource;
}

export const fetchServiceStops = async (input: FetchServiceStops) => {
    const searchApiUrl = `${API_BASE_URL}/services/${input.serviceId}/stops`;

    const queryStringItems = [];

    if (input.modes) {
        queryStringItems.push(`modes=${input.modes}`);
    }

    if (input.busStopType) {
        queryStringItems.push(`busStopType=${input.busStopType}`);
    }

    if (input.stopTypes) {
        queryStringItems.push(`stopTypes=${input.stopTypes}`);
    }

    if (input.dataSource) {
        queryStringItems.push(`dataSource=${input.dataSource}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = makeFilteredArraySchema(stopSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchOperatorsInput {
    adminAreaCodes: string[];
    dataSource?: Datasource;
}

export const fetchOperators = async (input: FetchOperatorsInput) => {
    const searchApiUrl = `${API_BASE_URL}/operators`;

    const queryStringItems = [`adminAreaCodes=${input.adminAreaCodes.join(",")}`];

    if (input.dataSource) {
        queryStringItems.push(`dataSource=${input.dataSource}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = makeFilteredArraySchema(operatorSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

export const fetchAdminAreaCodes = async () => {
    const searchApiUrl = `${API_BASE_URL}/area-codes`;

    const res = await fetch(searchApiUrl, {
        method: "GET",
    });

    const parseResult = z.array(z.string()).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};
