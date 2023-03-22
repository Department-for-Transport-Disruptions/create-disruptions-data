import { upperFirst, startCase, lowerCase } from "lodash";
import { NextApiResponse, NextPageContext } from "next";
import { z, ZodError, ZodErrorMap } from "zod";
import { ServerResponse } from "http";
import { DisplayValuePair, ErrorInfo, PageState, ResponseWithLocals } from "../interfaces";

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

export const getCsrfToken = (ctx: NextPageContext | NextPageContext): string =>
    (ctx.res as ResponseWithLocals)?.locals?.csrfToken ?? "";

export const splitCamelCaseToString = (s: string) => upperFirst(lowerCase(startCase(s)));

export const getDisplayByValue = (items: DisplayValuePair[], value: string) =>
    items.find((item) => item.value === value)?.display;

// Zod
export const setZodDefaultError: (errorMessage: string) => { errorMap: ZodErrorMap } = (errorMessage: string) => ({
    errorMap: (issue) => {
        switch (issue.code) {
            default:
                return { message: errorMessage };
        }
    },
});

const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/]\d{4}$/;
const timeRegex = /^([0-1][0-9]|2[0-3])[0-5][0-9]$/;
const minutesRegex = /^[0-9]{0,3}$/;

/**
 * Verify if the input value is of date format DD/MM/YYYY.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the input format is not DD/MM/YYYY.
 */

export const zodDate = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(dateRegex);

/**
 * Verify if the input value is of format hhmm where hh is 0-23 and mm is 0-59.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the regex match fails and the value
 *  is not of format hhmm.
 */
export const zodTime = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(timeRegex);

export const flattenZodErrors = (errors: ZodError) =>
    Object.values(
        errors.flatten<ErrorInfo>((val) => ({
            errorMessage: val.message,
            id: val.path.at(-1)?.toString() ?? "",
        })).fieldErrors,
    )
        .map((item) => item?.[0] ?? null)
        .filter(notEmpty);
/**
 * Verify if the input value is a number between 0-999 minutes.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the regex match fails.
 */
export const zodTimeInMinutes = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(minutesRegex);

export const getPageStateFromCookies = <T>(dataCookie: string, errorCookie: string, schemaObject: z.ZodType<T>) => {
    let inputsProps: PageState<Partial<T>> = {
        errors: [],
        inputs: {},
    };

    if (dataCookie) {
        const parsedData = schemaObject.safeParse(JSON.parse(dataCookie));

        if (parsedData.success) {
            inputsProps.inputs = parsedData.data;
        }
    } else if (errorCookie) {
        inputsProps = JSON.parse(errorCookie) as PageState<Partial<T>>;
    }

    return inputsProps;
};
