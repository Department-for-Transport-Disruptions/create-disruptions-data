import { Position } from "geojson";
import { z } from "zod";
import { API_BASE_URL } from "../constants";
import {
    operatorSchema,
    routesSchema,
    serviceByStopSchema,
    serviceSchema,
    stopSchema,
} from "../schemas/consequence.schema";

interface FetchStopsInput {
    adminAreaCodes: string[];
    polygon?: Position[];
    searchString?: string;
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

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = z.array(stopSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchServicesInput {
    adminAreaCodes?: string[];
}

export const fetchServices = async (input: FetchServicesInput) => {
    const searchApiUrl = `${API_BASE_URL}/services`;

    const queryStringItems = [];

    if (input.adminAreaCodes && input.adminAreaCodes.length > 0) {
        queryStringItems.push(`adminAreaCodes=${input.adminAreaCodes.join(",")}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = z.array(serviceSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchServicesByStopsInput {
    atcoCodes?: string[];
    includeRoutes?: boolean;
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

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = z.array(serviceByStopSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchServiceRoutes {
    serviceId: number;
}

export const fetchServiceRoutes = async (input: FetchServiceRoutes) => {
    const searchApiUrl = `${API_BASE_URL}/services/${input.serviceId}/routes`;

    const res = await fetch(searchApiUrl, {
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
}

export const fetchServiceStops = async (input: FetchServiceStops) => {
    const searchApiUrl = `${API_BASE_URL}/services/${input.serviceId}/stops`;

    const res = await fetch(searchApiUrl, {
        method: "GET",
    });

    const parseResult = z.array(stopSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

interface FetchOperatorsInput {
    adminAreaCodes: string[];
}

export const fetchOperators = async (input: FetchOperatorsInput) => {
    const searchApiUrl = `${API_BASE_URL}/operators`;

    const queryStringItems = [`adminAreaCodes=${input.adminAreaCodes.join(",")}`];

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = z.array(operatorSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};

export const fetchAdminAreaCodes = async () => {
    const searchApiUrl = `https://api.test.ref-data.dft-create-data.com/v1/area-codes`;

    const res = await fetch(searchApiUrl, {
        method: "GET",
    });

    const parseResult = z.array(z.string()).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};
