import { ConsequenceOperators, Journey, Service, Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { journeySchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import dayjs from "dayjs";
import { SetStateAction } from "react";
import { ParsedUrlQuery } from "querystring";
import { DISRUPTION_DETAIL_PAGE_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../constants";
import { PageState } from "../interfaces";
import { ServiceApiResponse } from "../schemas/consequence.schema";
import { sortServices } from ".";

export const getStateUpdater =
    <T>(setter: (value: SetStateAction<PageState<Partial<T>>>) => void, state: PageState<Partial<T>>) =>
    (change: string | string[], field: keyof T) => {
        setter({
            ...state,
            inputs: {
                ...state.inputs,
                [field]: change,
            },
        });
    };

export const operatorStateUpdater =
    <T>(setter: (value: SetStateAction<PageState<Partial<T>>>) => void, state: PageState<Partial<T>>) =>
    (change: ConsequenceOperators[], field: keyof T) => {
        setter({
            ...state,
            inputs: {
                ...state.inputs,
                [field]: change,
            },
        });
    };

export const getStopLabel = (stop: Stop) => {
    if (stop.commonName && stop.indicator && stop.atcoCode) {
        return `${stop.commonName} (${stop.indicator}) (${stop.atcoCode})`;
    } else if (stop.commonName && stop.atcoCode) {
        return `${stop.commonName} (${stop.atcoCode})`;
    } else {
        return "";
    }
};

export const getJourneyLabel = (journey: Journey) =>
    `${journey.departureTime} ${journey.origin} - ${journey.destination} (${journey.direction})`;

export const getJourney = (journey: Journey) => journey.vehicleJourneyCode;

export const sortJourneys = (journeys: Journey[]): Journey[] => {
    const journeysWithDates = journeys.map((journey) => {
        const [hours, minutes, seconds] = journey.departureTime.split(":");
        const departureDate = new Date();
        departureDate.setHours(Number(hours));
        departureDate.setMinutes(Number(minutes));
        departureDate.setSeconds(Number(seconds));
        return { ...journey, departureDate };
    });
    return journeysWithDates.sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime());
};

export const sortStops = (stops: Stop[]): Stop[] => {
    return stops.sort((a, b) => {
        if (a.commonName && a.indicator && a.atcoCode && b.indicator) {
            return (
                a.commonName.localeCompare(b.commonName) ||
                a.indicator.localeCompare(b.indicator) ||
                a.atcoCode.localeCompare(b.atcoCode)
            );
        } else {
            return a.commonName.localeCompare(b.commonName) || a.atcoCode.localeCompare(b.atcoCode);
        }
    });
};

export const sortAndFilterStops = (stops: Stop[]): Stop[] =>
    sortStops(stops).filter(
        (value, index, self) => index === self.findIndex((stop) => stop.atcoCode === value.atcoCode),
    );

export const getJourneyValue = (journey: Journey) => journey.vehicleJourneyCode;

export const getStopValue = (stop: Stop) => stop.atcoCode.toString();

export const getDataInPages = <T>(pageNumber: number, data: T[]): T[] => {
    const startPoint = (pageNumber - 1) * 10;
    const endPoint = pageNumber * 10;
    return data.slice(startPoint, endPoint);
};

export const getStopType = (stopType: string | undefined) => {
    if (stopType === "BCT") {
        return "Bus stop";
    } else if (stopType === "MET" || stopType === "PLT") {
        return "Tram stop";
    } else if (stopType === "FER" || stopType === "FBT") {
        return "Ferry terminal";
    } else {
        return "Stop";
    }
};

export const filterServices = <T extends ServiceApiResponse>(servicesData?: T[]) => {
    if (!servicesData?.length) {
        return [];
    }

    const services = sortServices(servicesData);
    const filterKey = services[0].dataSource === Datasource.tnds ? "serviceCode" : "lineId";

    return removeDuplicateServicesByKey(services, filterKey);
};

export const removeDuplicateServicesByKey = <T extends ServiceApiResponse>(
    services: T[],
    filterKey: "serviceCode" | "lineId",
) => {
    const setOfServiceIds = new Set();
    const filteredServices: T[] = [];
    const currentDate = getDate();

    services.forEach((currentService) => {
        const endDate = currentService.endDate === null ? currentDate.add(1, "day") : dayjs(currentService.endDate);
        if (!setOfServiceIds.has(currentService[filterKey])) {
            setOfServiceIds.add(currentService[filterKey]);
            filteredServices.push(currentService);
        } else {
            if (currentDate.isBetween(dayjs(currentService.startDate), endDate, "day", "[]")) {
                const serviceToReplace = filteredServices.findIndex(
                    (serviceToReplace) => serviceToReplace[filterKey] === currentService[filterKey],
                );
                filteredServices[serviceToReplace] = currentService;
            }
        }
    });
    return filteredServices;
};

export const showCancelButton = (queryParams: ParsedUrlQuery) => {
    return (
        (queryParams["return"]?.includes(REVIEW_DISRUPTION_PAGE_PATH) &&
            !queryParams["return"]?.includes("template")) ||
        (queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH) && !queryParams["return"]?.includes("template"))
    );
};

export const returnTemplateOverview = (queryParams: ParsedUrlQuery) => {
    return (
        (queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH) && queryParams["template"]?.includes("true")) ||
        (queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH) && queryParams["return"]?.includes("template"))
    );
};

export const isSelectedStopInDropdown = (stop: Stop, selectedStops: Stop[]) =>
    selectedStops.find((selectedStop) => selectedStop.atcoCode === stop.atcoCode);

export const isSelectedServiceInDropdown = (service: Service, selectedService: Service[]) =>
    selectedService.find((selectedService) => selectedService.id === service.id);

export const isSelectedJourneyInDropdown = (journey: Journey, selectedJourneys: Journey[]) =>
    selectedJourneys.find((selectedJourney) => selectedJourney.vehicleJourneyCode === journey.vehicleJourneyCode);
