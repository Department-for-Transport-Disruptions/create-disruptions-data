import { NextApiResponse } from "next";
import { destroyCookie, setCookie } from "nookies";
import { z, ZodError } from "zod";
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
    message: string,
    context: string,
    error: Error,
): void => {
    logger.error(message, { context, error: error.stack });
    redirectTo(res, "/error");
};

export const validateBodyAndRedirect = <T extends z.ZodTypeAny>(
    res: NextApiResponse,
    body: unknown,
    schema: T,
    dataCookie: string,
    errorCookie: string,
    currentPage: string,
    nextPage: string,
) => {
    try {
        const validatedBody = schema.parse(body) as object;
        setCookieOnResponseObject(dataCookie, JSON.stringify(validatedBody), res);
        setCookieOnResponseObject(errorCookie, "", res, 0);

        redirectTo(res, nextPage);
        return;
    } catch (e) {
        if (e instanceof ZodError) {
            setCookieOnResponseObject(
                errorCookie,
                JSON.stringify({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    inputs: body,
                    errors: Object.values(
                        e.flatten<ErrorInfo>((val) => ({
                            errorMessage: val.message,
                            id: val.path[0],
                        })).fieldErrors,
                    )
                        .map((item) => item?.[0] ?? null)
                        .filter((item) => item),
                }),
                res,
            );
            setCookieOnResponseObject(dataCookie, "", res, 0);
            redirectTo(res, currentPage);
            return;
        }

        redirectTo(res, currentPage);
    }
};
