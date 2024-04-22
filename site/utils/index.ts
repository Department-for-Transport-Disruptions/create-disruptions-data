import {
    Consequence,
    Disruption,
    NetworkConsequence,
    OperatorConsequence,
    Routes,
    Service,
    ServicesConsequence,
    Stop,
    StopsConsequence,
} from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Datasource, Modes, VehicleMode, PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import lowerCase from "lodash/lowerCase";
import startCase from "lodash/startCase";
import upperFirst from "lodash/upperFirst";
import { NextApiResponse, NextPageContext } from "next";
import { ZodError, ZodErrorMap } from "zod";
import { ServerResponse } from "http";
import { sortAndFilterStops } from "./formUtils";
import { VEHICLE_MODES } from "../constants";
import { fetchServiceStops } from "../data/refDataApi";
import { DisplayValuePair, ErrorInfo } from "../interfaces";
import { ServiceWithStopAndRoutes } from "../schemas/consequence.schema";
import { FullDisruption } from "../schemas/disruption.schema";

export const mapValidityPeriods = (disruption: Disruption) =>
    disruption.validity?.map((period) => ({
        startTime: getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).toISOString(),
        endTime:
            period.disruptionEndDate && period.disruptionEndTime
                ? getDatetimeFromDateAndTime(period.disruptionEndDate, period.disruptionEndTime).toISOString()
                : null,
    })) ?? [];

export const reduceStringWithEllipsis = (input: string, maximum: number): string => {
    if (input.length < maximum) {
        return input;
    }

    return `${input.substring(0, maximum)}...`;
};

export const notEmpty = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

export const buildTitle = (errors: ErrorInfo[], title: string): string => {
    if (errors.length > 0) {
        return `Error: ${title}`;
    }

    return title;
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const getCsrfToken = (ctx: NextPageContext): string =>
    ctx.res?.getHeader("x-csrf-token")?.toString() ?? "missing";

export const splitCamelCaseToString = (s: string) => upperFirst(lowerCase(startCase(s)));

export const getDisplayByValue = (items: DisplayValuePair[], value: string) =>
    items.find((item) => item.value === value)?.display;

export const getServiceLabel = (service: Service) =>
    `${service.lineName} - ${service.origin} - ${service.destination} (${service.operatorShortName})`;

export const isFullConsequence = (consequence: unknown): consequence is Consequence =>
    !!(consequence as Consequence).description;

export const isNetworkConsequence = (consequence: unknown): consequence is NetworkConsequence =>
    isFullConsequence(consequence) && consequence.consequenceType === "networkWide";

export const isOperatorConsequence = (consequence: unknown): consequence is OperatorConsequence =>
    isFullConsequence(consequence) && consequence.consequenceType === "operatorWide";

export const isStopsConsequence = (consequence: unknown): consequence is StopsConsequence =>
    isFullConsequence(consequence) && consequence.consequenceType === "stops";

export const isServicesConsequence = (consequence: unknown): consequence is ServicesConsequence =>
    isFullConsequence(consequence) && consequence.consequenceType === "services";

export const getLargestConsequenceIndex = (disruption: FullDisruption) => {
    const largestConsequenceIndex =
        disruption.consequences && disruption.consequences.length > 0
            ? disruption.consequences?.reduce((p, c) => (p.consequenceIndex > c.consequenceIndex ? p : c))
                  .consequenceIndex
            : 0;

    const largestDeletedConsequenceIndex =
        disruption.deletedConsequences && disruption.deletedConsequences.length > 0
            ? disruption.deletedConsequences?.reduce((p, c) => (p.consequenceIndex > c.consequenceIndex ? p : c))
                  .consequenceIndex
            : 0;

    return Math.max(largestConsequenceIndex, largestDeletedConsequenceIndex);
};

// Zod
export const setZodDefaultError: (errorMessage: string) => { errorMap: ZodErrorMap } = (errorMessage: string) => ({
    errorMap: (issue) => {
        switch (issue.code) {
            default:
                return { message: errorMessage };
        }
    },
});

export const flattenZodErrors = (errors: ZodError) =>
    Object.values(
        errors.flatten<ErrorInfo>((val) => ({
            errorMessage: val.message,
            id: val.path.at(-1)?.toString() ?? "",
        })).fieldErrors,
    )
        .map((item) => item?.[0] ?? null)
        .filter(notEmpty);

export const sortServices = <T extends Service>(services: T[]): T[] => {
    return services.sort((a, b) => {
        return (
            a.lineName.localeCompare(b.lineName, "en", { numeric: true }) ||
            a.origin.localeCompare(b.origin) ||
            a.destination.localeCompare(b.destination) ||
            a.operatorShortName.localeCompare(b.operatorShortName)
        );
    });
};

export const toLowerStartCase = (text: string) => startCase(text.toLowerCase());

export const filterDisruptionsForOperatorUser = (disruptions: Disruption[], operatorOrgId: string | null) => {
    return disruptions.filter(
        (disruption) =>
            disruption.createdByOperatorOrgId === operatorOrgId ||
            (!disruption.createdByOperatorOrgId && disruption.publishStatus === PublishStatus.published),
    );
};

export const getStops = async (
    serviceRef: string,
    serviceId: number,
    dataSource: Datasource,
    vehicleMode?: VehicleMode | Modes,
): Promise<Stop[]> => {
    if (serviceRef) {
        const stopsData = await fetchServiceStops({
            serviceRef,
            dataSource,
            modes: vehicleMode === VehicleMode.tram ? "tram, metro" : vehicleMode,
            ...(vehicleMode === VehicleMode.bus ? { busStopTypes: "MKD,CUS" } : {}),
            ...(vehicleMode === VehicleMode.bus
                ? { stopTypes: "BCT" }
                : vehicleMode === VehicleMode.tram ||
                  vehicleMode === Modes.metro ||
                  vehicleMode === VehicleMode.underground
                ? { stopTypes: "MET, PLT" }
                : vehicleMode === Modes.ferry || vehicleMode === VehicleMode.ferryService
                ? { stopTypes: "FER, FBT" }
                : { stopTypes: "undefined" }),
        });

        if (stopsData) {
            return sortAndFilterStops(
                stopsData.map((stop) => ({
                    ...stop,
                    ...(serviceId && { serviceIds: [serviceId] }),
                })),
            );
        }
    }

    return [];
};

export type RouteWithServiceInfo = Routes & { serviceId: number; serviceCode: string; lineId: string };

export const removeDuplicateRoutes = (routes: Partial<RouteWithServiceInfo[]>) => {
    return routes.filter(
        (value, index, self) => index === self.findIndex((route) => route?.serviceId === value?.serviceId),
    );
};

export const getRoutesForServices = (services: ServiceWithStopAndRoutes[]) =>
    services.map((service) => ({
        inbound: service.routes.inbound,
        outbound: service.routes.outbound,
        serviceId: service.id,
        serviceCode: service.serviceCode,
        lineId: service.lineId,
    }));

export const getStopsForRoutes = async (
    routes: Partial<RouteWithServiceInfo[]>,
    vehicleMode: VehicleMode | undefined,
    dataSource: Datasource,
) => {
    return (
        await Promise.all(
            routes.map(async (route) => {
                if (route) {
                    return getStops(
                        dataSource === Datasource.bods ? route.lineId : route.serviceCode,
                        route.serviceId,
                        dataSource,
                        vehicleMode,
                    );
                }
                return [];
            }),
        )
    ).flat();
};

export const toTitleCase = (text: string) => {
    return text.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
};

export const removeDuplicates = <T, K extends keyof T>(arrayToRemoveDuplicates: T[], key: K): T[] =>
    arrayToRemoveDuplicates.filter(
        (value, index, self) => index === self.findIndex((item) => item[key] === value[key]),
    );

export const filterVehicleModes = (showUnderground: boolean) =>
    VEHICLE_MODES.filter((v) => (showUnderground ? true : v.value !== VehicleMode.underground));
