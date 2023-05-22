import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
    CREATE_CONSEQUENCE_STOPS_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { Stop, StopsConsequence, stopsConsequenceSchema } from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

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
        const queryParam = getReturnPage(req);

        const formattedBody = formatCreateConsequenceStopsBody(req.body as object);

        const validatedBody = stopsConsequenceSchema.safeParse(formattedBody);

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        if (!validatedBody.success) {
            const body = req.body as StopsConsequence;

            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_STOPS_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(
                res,
                `${CREATE_CONSEQUENCE_STOPS_PATH}/${body.disruptionId}/${body.consequenceIndex}${
                    queryParam ? `?${queryParam}` : ""
                }`,
            );
            return;
        }

        await upsertConsequence(validatedBody.data, session.orgId, session.isOrgStaff);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_STOPS_ERRORS, res);

        const redirectPath =
            queryParam && decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}`);

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
