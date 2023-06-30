import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { ErrorInfo, PageState } from "../interfaces";
import { Service, Stop } from "../schemas/consequence.schema";
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

// eslint-disable-next-line @typescript-eslint/require-await
export const filterServices = async (servicesData?: Service[]) => {
    let services: Service[] = [];
    if (servicesData && servicesData.length > 0) {
        services = sortServices(servicesData);

        const setOfServices = new Set();

        const filteredServices: Service[] = services.filter((item) => {
            const serviceDisplay = item.lineName + item.origin + item.destination + item.operatorShortName;
            if (!setOfServices.has(serviceDisplay)) {
                setOfServices.add(serviceDisplay);
                return true;
            } else {
                return false;
            }
        });

        services = filteredServices;
    }

    return services;
};
