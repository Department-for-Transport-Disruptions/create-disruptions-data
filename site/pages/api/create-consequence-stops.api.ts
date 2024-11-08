import { Stop, StopsConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { stopsConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
    CREATE_CONSEQUENCE_STOPS_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants";
import { TooManyConsequencesError } from "../../errors";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    handleUpsertConsequence,
    isDisruptionFromTemplate,
    redirectTo,
    redirectToError,
    redirectToWithQueryParams,
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
        const isFromTemplate = isDisruptionFromTemplate(req);

        const { template, addAnotherConsequence, draft } = req.query;

        const body = req.body as StopsConsequence;

        const formattedBody = formatCreateConsequenceStopsBody(body);

        const validatedBody = stopsConsequenceSchema.safeParse(formattedBody);

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        if (session.isOperatorUser) {
            throw new Error("Operator users are not permitted to create stop type consequences");
        }

        if (!validatedBody.success) {
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

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${CREATE_CONSEQUENCE_STOPS_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                queryParam ? [queryParam] : [],
            );
            return;
        }

        const maxConsequenceIndex = await handleUpsertConsequence(
            validatedBody.data,
            session.orgId,
            session.name,
            session.isOrgStaff,
            template === "true",
            formattedBody,
            COOKIES_CONSEQUENCE_STOPS_ERRORS,
            res,
        );
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_STOPS_ERRORS, res);

        const redirectPath =
            (!isFromTemplate || template) &&
            queryParam &&
            decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        if (addAnotherConsequence) {
            const currentIndex = validatedBody.data.consequenceIndex;
            const nextIndex = currentIndex >= maxConsequenceIndex ? currentIndex + 1 : maxConsequenceIndex + 1;

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/${nextIndex}`,
                queryParam ? [queryParam] : [],
            );
            return;
        }

        if (draft) {
            redirectTo(res, DASHBOARD_PAGE_PATH);
            return;
        }
        redirectToWithQueryParams(
            req,
            res,
            template ? ["template"] : [],
            `${redirectPath}/${validatedBody.data.disruptionId}`,
            queryParam ? [queryParam] : [],
        );
        return;
    } catch (e) {
        if (e instanceof TooManyConsequencesError) {
            const body = req.body as StopsConsequence;
            const queryParam = getReturnPage(req);

            redirectToWithQueryParams(
                req,
                res,
                req.query.template === "true" ? ["template"] : [],
                `${CREATE_CONSEQUENCE_STOPS_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                queryParam ? [queryParam] : [],
            );

            return;
        }

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
