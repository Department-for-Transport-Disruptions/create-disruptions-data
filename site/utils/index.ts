import { NextPageContext } from "next";
// eslint-disable-next-line @next/next/no-document-import-in-page
import { DocumentContext } from "next/document";
import { ErrorInfo, ResponseWithLocals } from "../interfaces";

export const buildTitle = (errors: ErrorInfo[], title: string): string => {
    if (errors.length > 0) {
        return `Error: ${title}`;
    }

    return title;
};

export const getCsrfToken = (ctx: DocumentContext | NextPageContext | NextPageContext): string =>
    (ctx.res as ResponseWithLocals)?.locals?.csrfToken ?? "";
