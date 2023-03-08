/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextApiRequest, NextPageContext } from "next";
// eslint-disable-next-line @next/next/no-document-import-in-page
import { ServerResponse } from "http";

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface ResponseWithLocals extends ServerResponse {
    locals: {
        nonce: string;
        csrfToken: string;
    };
}

export interface CookiePolicy {
    essential: boolean;
    usage: boolean;
}

export interface CookiesApiRequest extends NextApiRequest {
    body: {
        tracking: "on" | "off";
    };
}
