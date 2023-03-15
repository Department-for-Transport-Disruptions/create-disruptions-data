import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { upperFirst, startCase, lowerCase } from "lodash";
import { NextApiResponse, NextPageContext } from "next";
import { z, ZodErrorMap } from "zod";
import { ServerResponse } from "http";
import { ErrorInfo, ResponseWithLocals } from "../interfaces";

dayjs.extend(customParseFormat);

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

export const convertDateTimeToFormat = (dateOrTime: string, format: string) => dayjs(dateOrTime).format(format);

export const formatTime = (time: string) =>
    time.length === 4 ? time.slice(0, -2) + ":" + time.slice(-2) : new Error("Time must be 4 digits long");

export const splitCamelCaseToString = (s: string) => upperFirst(lowerCase(startCase(s)));
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
