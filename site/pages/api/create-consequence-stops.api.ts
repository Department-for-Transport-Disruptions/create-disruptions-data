import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
    CREATE_CONSEQUENCE_STOPS_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    ERROR_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { Stop, StopsConsequence, stopsConsequenceSchema } from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

export const formatCreateConsequenceStopsBody = (body: object) => {
    const stops = Object.entries(body)
        .filter((item) => item.toString().startsWith("stop"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return JSON.parse(values) as Stop;
        });

    const cleansedBody = Object.fromEntries(Object.entries(body).filter((item) => !item.toString().startsWith("stop")));
    return {
        ...cleansedBody,
        stops,
    };
};

const createConsequenceStops = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const formattedBody = formatCreateConsequenceStopsBody(req.body as object);

        const validatedBody = stopsConsequenceSchema.safeParse(formattedBody);

        if (!validatedBody.success) {
            const body = req.body as StopsConsequence;

            if (!body.disruptionId || !body.consequenceIndex) {
                redirectTo(res, ERROR_PATH);
                return;
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_STOPS_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, `${CREATE_CONSEQUENCE_STOPS_PATH}/${body.disruptionId}/${body.consequenceIndex}`);
            return;
        }

        await upsertConsequence(validatedBody.data);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_STOPS_ERRORS, res);

        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${validatedBody.data.disruptionId}`);
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
