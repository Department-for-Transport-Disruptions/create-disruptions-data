import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NextApiResponse, NextPageContext } from "next";
import { z, ZodError, ZodErrorMap } from "zod";
import { ServerResponse } from "http";
import { ErrorInfo, ResponseWithLocals } from "../interfaces";

dayjs.extend(customParseFormat);

const notEmpty = <T>(value: T | null | undefined): value is T => {
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

export const getDate = (date: string | Date) => dayjs(date, "DD/MM/YYYY");
export const getDatetimeFromDateAndTime = (date: string, time: string) => dayjs(`${date} ${time}`, "DD/MM/YYYY HHmm");

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

export const zodDate = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(dateRegex);

export const zodTime = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(timeRegex);

export const flattenZodErrors = (errors: ZodError) =>
    Object.values(
        errors.flatten<ErrorInfo>((val) => ({
            errorMessage: val.message,
            id: val.path[0].toString(),
        })).fieldErrors,
    )
        .map((item) => item?.[0] ?? null)
        .filter(notEmpty);
