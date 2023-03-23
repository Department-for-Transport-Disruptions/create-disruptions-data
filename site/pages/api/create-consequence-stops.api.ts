import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
    COOKIES_CONSEQUENCE_INFO,
    CREATE_CONSEQUENCE_STOPS_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { createConsequenceStopsSchema } from "../../schemas/create-consequence-stops.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

export const formatCreateConsequenceStopsBody = (body: object) => {
    const stopsImpacted = Object.entries(body)
        .filter((item) => item.toString().startsWith("stop"))
        .map((arr: string[]) => {
            const [, values] = arr;

            return {
                commonName: values[0],
                indicator: values[1],
                atcoCode: values[2],
            };
        });

    const cleansedBody = Object.fromEntries(Object.entries(body).filter((item) => !item.toString().startsWith("stop")));

    return {
        ...cleansedBody,
        stopsImpacted,
    };
};

const createConsequenceStops = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const formattedBody = formatCreateConsequenceStopsBody(req.body as object);

        const validatedBody = createConsequenceStopsSchema.safeParse(formattedBody);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_STOPS_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_INFO, res);

            redirectTo(res, CREATE_CONSEQUENCE_STOPS_PATH);
            return;
        }

        setCookieOnResponseObject(COOKIES_CONSEQUENCE_INFO, JSON.stringify(validatedBody.data), res);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_STOPS_ERRORS, res);

        redirectTo(res, REVIEW_DISRUPTION_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem adding a consequence stops.";
            redirectToError(res, message, "api.create-consequence-stops", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createConsequenceStops;
