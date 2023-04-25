import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { ErrorInfo, PageState } from "../interfaces";
import { Stop } from "../schemas/consequence.schema";

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
