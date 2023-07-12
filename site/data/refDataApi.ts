import { Datasource, Modes, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
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

export const fetchStops = async (input: FetchStopsInput, vehicleMode?: string) => {
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

    const filteredStopsData = parseResult.data.filter((stop) => {
        if (
            stop.stopType === "BCT" &&
            stop.busStopType === "MKD" &&
            (vehicleMode === VehicleMode.bus.toString() || vehicleMode === "")
        ) {
            return stop;
        } else if (
            stop.stopType &&
            ["MET", "PLT"].includes(stop.stopType) &&
            (vehicleMode === VehicleMode.tram.toString() || vehicleMode === "metro")
        ) {
            return stop;
        } else if (
            stop.stopType &&
            ["FER", "FBT"].includes(stop.stopType) &&
            (vehicleMode === VehicleMode.ferryService.toString() || vehicleMode === "ferry")
        ) {
            return stop;
        } else {
            return false;
        }
    });

    return filteredStopsData;
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

    const parseResult = z.array(serviceSchema).safeParse(await res.json());

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

    const parseResult = z.array(operatorSchema).safeParse(await res.json());

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
