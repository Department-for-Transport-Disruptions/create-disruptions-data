import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies, setCookie } from "nookies";
import { z } from "zod";
import { randomUUID } from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import {
    COOKIES_POLICY_COOKIE,
    COOKIE_CSRF,
    COOKIE_ID_TOKEN,
    COOKIE_PREFERENCES_COOKIE,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { getDisruptionById, upsertConsequence, upsertDisruptionInfo } from "../../data/dynamo";
import { PageState } from "../../interfaces";
import { Consequence } from "../../schemas/consequence.schema";
import { DisruptionInfo } from "../../schemas/create-disruption.schema";
import logger from "../logger";

export const setCookieOnResponseObject = (
    cookieName: string,
    cookieValue: string,
    res: NextApiResponse | ServerResponse<IncomingMessage>,
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

export const destroyCookieOnResponseObject = (
    cookieName: string,
    res: NextApiResponse | ServerResponse<IncomingMessage>,
): void => {
    setCookieOnResponseObject(cookieName, "", res, 0);
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

export const cleardownCookies = (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = parseCookies({ req });

    const saveList = [COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE, COOKIE_ID_TOKEN, COOKIE_CSRF];

    Object.keys(cookies).forEach((cookie) => {
        if (!saveList.includes(cookie)) {
            destroyCookieOnResponseObject(cookie, res);
        }
    });
};

export const getPageState = <T>(errorCookie: string, schemaObject: z.ZodType<T>, disruptionId?: string, data?: T) => {
    const inputsProps: PageState<Partial<T>> = {
        errors: [],
        inputs: {},
        disruptionId: disruptionId || "",
    };

    if (errorCookie) {
        return { ...(JSON.parse(errorCookie) as PageState<Partial<T>>), disruptionId: disruptionId || "" };
    }

    if (disruptionId) {
        const parsedData = schemaObject.safeParse(data);

        if (parsedData.success) {
            inputsProps.inputs = parsedData.data;
        }
    }

    return inputsProps;
};

export const getReturnPage = (req: NextApiRequest) => {
    const queryParam = req.headers.referer?.split("?")[1];
    const decodedQueryParam = queryParam ? decodeURIComponent(queryParam) : null;
    return decodedQueryParam?.includes(REVIEW_DISRUPTION_PAGE_PATH) ||
        decodedQueryParam?.includes(DISRUPTION_DETAIL_PAGE_PATH)
        ? queryParam
        : null;
};

export const upsertDisruptionsWithDuplicates = async (disruption: DisruptionInfo) => {
    const dbDisruption = await getDisruptionById(disruption.disruptionId);

    if (dbDisruption && !dbDisruption.duplicateId) {
        const duplicateId = randomUUID();

        await Promise.all([
            upsertDisruptionInfo({ ...disruption, duplicateId: duplicateId }),
            upsertDisruptionInfo({ ...disruption, disruptionId: duplicateId }),
        ]);
    } else {
        await upsertDisruptionInfo(disruption);
    }
};

export const upsertConsequencesWithDuplicates = async (consequence: Consequence) => {
    const dbDisruption = await getDisruptionById(consequence.disruptionId);

    let duplicateId: string | undefined = dbDisruption?.duplicateId ? dbDisruption?.duplicateId : randomUUID();

    if (dbDisruption?.consequences)
        await Promise.all(
            dbDisruption?.consequences?.map((existingConsq) => {
                if (!existingConsq.disruptionId && duplicateId) {
                    void upsertConsequence({ ...existingConsq, duplicateId: duplicateId });
                    void upsertConsequence({ ...existingConsq, disruptionId: duplicateId });
                }

                duplicateId = existingConsq.disruptionId ? existingConsq.duplicateId : duplicateId;
            }),
        );
    await upsertConsequence({ ...consequence, duplicateId: duplicateId });
};
