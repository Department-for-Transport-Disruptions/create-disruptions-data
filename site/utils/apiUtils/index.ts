import { NextApiResponse } from "next";
import { setCookie } from "nookies";
import { ServerResponse } from "http";
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

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const redirectToError = (
    res: NextApiResponse | ServerResponse,
    message: string,
    context: string,
    error: Error,
): void => {
    logger.error(message, { context, error: error.stack });
    redirectTo(res, "/error");
};

export const isValueInArray = (value: unknown, array: string[]): boolean => {
    let isValid = false;
    console.log("value---", value);
    console.log("array---", array);
    if (value && array.includes(value as string)) {
        isValid = true;
    }

    return isValid;
};
