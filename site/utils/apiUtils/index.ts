import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";
import { ServerResponse } from "http";
import logger from "../logger";

export const setCookieOnResponseObject = (
    cookieName: string,
    cookieValue: string,
    req: NextApiRequest,
    res: NextApiResponse,
    lifetime?: number,
    httpOnly = true,
): void => {
    const cookies = new Cookies(req, res);
    // From docs: All cookies are httponly by default, and cookies sent over SSL are secure by
    // default. An error will be thrown if you try to send secure cookies over an insecure socket.
    cookies.set(cookieName, cookieValue, {
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
