import { NextApiResponse } from "next";
import { destroyCookie, setCookie } from "nookies";
import { ZodError } from "zod";
import { ServerResponse } from "http";
import { ErrorInfo } from "../../interfaces";
import logger from "../logger";

export const setCookieOnResponseObject = (
    cookieName: string,
    cookieValue: string,
    res: NextApiResponse,
    lifetime?: number,
    httpOnly = true,
): void => {
    // From docs: All cookies are httponly by default, and cookies sent over SSL are secure by
    // default. An error will be thrown if you try to send secure cookies over an insecure socket.
    setCookie({ res }, cookieName, cookieValue, {
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        maxAge: lifetime,
        httpOnly,
    });
};

export const destroyCookieOnResponseObject = (cookieName: string, res: NextApiResponse): void => {
    destroyCookie({ res }, cookieName);
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const redirectToError = (
    res: NextApiResponse | ServerResponse,
    message?: string,
    context?: string,
    error?: Error,
): void => {
    if (message && context && error) {
        logger.error(message, { context, error: error.stack });
    }

    redirectTo(res, "/500");
};

export const flattenZodErrors = (errors: ZodError) =>
    Object.values(
        errors.flatten<ErrorInfo>((val) => ({
            errorMessage: val.message,
            id: val.path[0],
        })).fieldErrors,
    )
        .map((item) => item?.[0] ?? null)
        .filter((item) => item);
