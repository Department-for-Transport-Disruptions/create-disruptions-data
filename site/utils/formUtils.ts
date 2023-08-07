import dayjs from "dayjs";
import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { ErrorInfo, PageState } from "../interfaces";
import { ConsequenceOperators, Service, Stop } from "../schemas/consequence.schema";
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

export const filterServices = (servicesData?: Service[]) => {
    let services: Service[] = [];

    if (servicesData && servicesData.length > 0) {
        services = sortServices(servicesData);

        if (services[0].dataSource === "tnds") {
            return filterTndsServices(services);
        } else {
            //TODO add filterBodsServices function here
            return [];
        }
    }
    return services;
};

export const filterTndsServices = (services: Service[]) => {
    const now = dayjs();
    const setOfServices = new Set();
    const validDuplicates: Service[] = [];
    const filteredServices: Service[] = [];

    services.forEach((currentService) => {
        if (!setOfServices.has(currentService.serviceCode)) {
            setOfServices.add(currentService.serviceCode);
            filteredServices.push(currentService);
            return;
        } else {
            if (dayjs(now).isBetween(dayjs(currentService.startDate), dayjs(currentService.endDate), "day", "[]")) {
                validDuplicates.push(currentService);
                const serviceToReplace = filteredServices.findIndex(
                    (serviceToReplace) => serviceToReplace.serviceCode === currentService.serviceCode,
                );
                filteredServices[serviceToReplace] = currentService;
            }
            return false;
        }
    });

    return filteredServices;
};
