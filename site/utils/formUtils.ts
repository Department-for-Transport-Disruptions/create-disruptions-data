import dayjs from "dayjs";
import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { getDate } from "./dates";
import { ErrorInfo, PageState } from "../interfaces";
import { ConsequenceOperators, ServiceApiResponse, Stop } from "../schemas/consequence.schema";
import { sortServices } from ".";

export const handleBlur = <T>(
    input: string,
    inputName: Extract<keyof T, string>,
    stateUpdater: (change: string, field: keyof T) => void,
    setErrors: Dispatch<SetStateAction<ErrorInfo[]>>,
    schema?: z.ZodTypeAny,
    disabled?: boolean,
) => {
    stateUpdater(input, inputName);

    if (schema && !disabled) {
        const parsed = schema.safeParse(input);

        if (parsed.success === false) {
            setErrors([
                {
                    id: inputName,
                    errorMessage: parsed.error.errors[0].message,
                },
            ]);
        } else {
            setErrors([]);
        }
    }
};

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

export const getStopValue = (stop: Stop) => stop.atcoCode.toString();

export const sortStops = (stops: Stop[]) => {
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

export const filterServices = (servicesData?: ServiceApiResponse[]) => {
    if (!servicesData?.length) {
        return [];
    }

    const services = sortServices(servicesData);
    const filterKey = services[0].dataSource === "tnds" ? "serviceCode" : "lineId";

    return removeDuplicateServicesByKey(services, filterKey);
};

export const removeDuplicateServicesByKey = (services: ServiceApiResponse[], filterKey: "serviceCode" | "lineId") => {
    const setOfServiceIds = new Set();
    const filteredServices: ServiceApiResponse[] = [];
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
