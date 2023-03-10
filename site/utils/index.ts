import { NextApiResponse, NextPageContext } from "next";
import { ServerResponse } from "http";
import { ErrorInfo, ResponseWithLocals } from "../interfaces";

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
