import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NextApiResponse, NextPageContext } from "next";
import { parseCookies } from "nookies";
import { z, ZodErrorMap } from "zod";
import { ServerResponse } from "http";
import { ErrorInfo, PageState, ResponseWithLocals } from "../interfaces";

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

export const getDate = (date: string | Date) => dayjs(date, "DD/MM/YYYY");
export const getDatetimeFromDateAndTime = (date: string, time: string) => dayjs(`${date} ${time}`, "DD/MM/YYYY HHmm");

export const getInitialPageStateFromZodSchema = <T extends z.ZodTypeAny>(
    ctx: NextPageContext,
    dataCookieName: string,
    errorCookieName: string,
    schema: T,
) => {
    let pageState: PageState<Partial<T>> = {
        errors: [],
        inputs: {},
    };

    const cookies = parseCookies(ctx);

    const dataCookie = cookies[dataCookieName];
    const errorCookie = cookies[errorCookieName];

    if (dataCookie) {
        pageState.inputs = schema.parse(JSON.parse(dataCookie)) as Partial<T>;
    } else if (errorCookie) {
        pageState = JSON.parse(errorCookie) as PageState<Partial<T>>;
    }

    return pageState;
};

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
