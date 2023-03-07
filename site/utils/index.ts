import { NextPageContext } from "next";
import { DocumentContextWithSession, ErrorInfo, NextPageContextWithSession, ResponseWithLocals } from "../interfaces";

export const buildTitle = (errors: ErrorInfo[], title: string): string => {
    if (errors.length > 0) {
        return `Error: ${title}`;
    }

    return title;
};

export const getCsrfToken = (ctx: DocumentContextWithSession | NextPageContextWithSession | NextPageContext): string =>
    (ctx.res as ResponseWithLocals)?.locals?.csrfToken ?? "";
