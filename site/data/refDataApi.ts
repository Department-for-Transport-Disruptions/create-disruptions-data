import { routesSchema } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { serviceSchema, stopSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, Modes } from "@create-disruptions-data/shared-ts/enums";
import { roadwork } from "@create-disruptions-data/shared-ts/roadwork.zod";
import { makeFilteredArraySchema } from "@create-disruptions-data/shared-ts/utils/zod";
import { Position } from "geojson";
import { z } from "zod";
import { API_BASE_URL } from "../constants";
import { LargePolygonError, NoStopsError } from "../errors";
import { operatorSchema, serviceWithStopsAndRoutesSchema } from "../schemas/consequence.schema";
import { filterServices } from "../utils/formUtils";

interface FetchStopsInput {
    adminAreaCodes: string[];
    polygon?: Position[];
    searchString?: string;
    stopTypes?: string[];
    busStopTypes?: string;
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
    if (input.busStopTypes) {
        queryStringItems.push(`busStopTypes=${input.busStopTypes}`);
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
    if (parseResult.data.length === 0) {
        throw new NoStopsError();
    }
    return parseResult.data;
};

interface FetchServicesInput {
    adminAreaCodes?: string[];
    dataSource?: Datasource;
    modes?: Modes[];
    nocCodes?: string[];
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

    if (input.nocCodes && input.nocCodes.length > 0) {
        queryStringItems.push(`nocCodes=${input.nocCodes.join(",")}`);
    }

    if (input.modes && input.modes.length > 0) {
        queryStringItems.push(`modes=${input.modes.join(",")}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = makeFilteredArraySchema(serviceSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchServicesByStopsInput {
    atcoCodes: string[];
    adminAreaCodes?: string[];
    includeRoutes?: boolean;
    dataSource?: Datasource;
    nocCodes?: string[];
}

export const fetchServicesByStops = async (input: FetchServicesByStopsInput) => {
    const searchApiUrl = `${API_BASE_URL}/services`;

    const queryStringItems = [];

    if (input.atcoCodes) {
        queryStringItems.push(`atcoCodes=${input.atcoCodes.join(",")}`);
    }

    if (input.nocCodes && input.nocCodes.length > 0) {
        queryStringItems.push(`nocCodes=${input.nocCodes.join(",")}`);
    }

    if (input.includeRoutes) {
        queryStringItems.push("includeRoutes=true");
    }

    if (input.dataSource) {
        queryStringItems.push(`dataSource=${input.dataSource}`);
    }

    if (input.adminAreaCodes && input.adminAreaCodes.length > 0) {
        queryStringItems.push(`adminAreaCodes=${input.adminAreaCodes.join(",")}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = makeFilteredArraySchema(serviceWithStopsAndRoutesSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return filterServices(parseResult.data);
};

interface FetchServiceRoutes {
    serviceRef: string;
    dataSource: Datasource;
    busStopTypes?: string;
    modes?: string;
    stopTypes?: string;
}

export const fetchServiceRoutes = async (input: FetchServiceRoutes) => {
    const searchApiUrl = `${API_BASE_URL}/services/${input.serviceRef}/routes`;

    const queryStringItems = [`dataSource=${input.dataSource}`];

    if (input.modes) {
        queryStringItems.push(`modes=${input.modes}`);
    }

    if (input.busStopTypes) {
        queryStringItems.push(`busStopTypes=${input.busStopTypes}`);
    }

    if (input.stopTypes) {
        queryStringItems.push(`stopTypes=${input.stopTypes}`);
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
    serviceRef: string;
    dataSource: Datasource;
    busStopTypes?: string;
    modes?: string;
    stopTypes?: string;
}

export const fetchServiceStops = async (input: FetchServiceStops) => {
    const searchApiUrl = `${API_BASE_URL}/services/${input.serviceRef}/stops`;
    const queryStringItems = [`dataSource=${input.dataSource}`];

    if (input.modes) {
        queryStringItems.push(`modes=${input.modes}`);
    }

    if (input.busStopTypes) {
        queryStringItems.push(`busStopTypes=${input.busStopTypes}`);
    }

    if (input.stopTypes) {
        queryStringItems.push(`stopTypes=${input.stopTypes}`);
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


interface FetchRoadworksInput {
    adminAreaCodes?: string[];
}
export const fetchRoadworks = async (input: FetchRoadworksInput) => {
    const searchApiUrl = `${API_BASE_URL}/roadworks`;

    const queryStringItems = [];

    if (input.adminAreaCodes) {
        queryStringItems.push(`adminAreaCodes=${input.adminAreaCodes.join(",")}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = z.array(roadwork).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchRoadworkByIdInput {
    permitReferenceNumber: string;
}

export const fetchRoadworkById = async (input: FetchRoadworkByIdInput) => {
    const searchApiUrl = `${API_BASE_URL}/roadworks/${input.permitReferenceNumber}`;

    const isValidPermitReferenceInput = /^[\w.\-]+$/.test(input.permitReferenceNumber);

    if (!isValidPermitReferenceInput) {
        return null;
    }

    const res = await fetch(searchApiUrl, {
        method: "GET",
    });

    if (res.status === 404) {
        return null;
    }

    const parseResult = roadwork.safeParse(await res.json());

    if (!parseResult.success) {
        return null;
    }

    return parseResult.data;
};
