import { NextPageContext } from "next";
import { ErrorInfo, ResponseWithLocals } from "../interfaces";

export const buildTitle = (errors: ErrorInfo[], title: string): string => {
    if (errors.length > 0) {
        return `Error: ${title}`;
    }

    return title;
};

export const getCsrfToken = (ctx: NextPageContext | NextPageContext): string =>
    (ctx.res as ResponseWithLocals)?.locals?.csrfToken ?? "";
