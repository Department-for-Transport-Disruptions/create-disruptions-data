import { NetworkConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { networkConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants";
import { TooManyConsequencesError } from "../../errors";
import { flattenZodErrors, getLargestConsequenceIndex } from "../../utils";
import {
    destroyCookieOnResponseObject,
    handleUpsertConsequence,
    redirectTo,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const createConsequenceNetwork = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const body = req.body as NetworkConsequence;
        const validatedBody = networkConsequenceSchema.safeParse(body);
        const session = getSession(req);

        const { draft, isFromTemplate, addAnotherConsequence } = req.query;

        if (!session) {
            throw new Error("No session found");
        }

        if (!validatedBody.success) {
            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_NETWORK_ERRORS,
                JSON.stringify({
                    inputs: body,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectToWithQueryParams(
                req,
                res,
                [],
                `${CREATE_CONSEQUENCE_NETWORK_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                isFromTemplate ? ["isFromTemplate=true"] : [],
            );
            return;
        }

        const disruption = await handleUpsertConsequence(
            validatedBody.data,
            session.orgId,
            session.isOrgStaff,
            false,
            body,
            COOKIES_CONSEQUENCE_NETWORK_ERRORS,
            res,
        );

        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_NETWORK_ERRORS, res);

        const redirectPath =
            !isFromTemplate && disruption?.publishStatus !== PublishStatus.draft
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        if (addAnotherConsequence) {
            if (!disruption) {
                throw new Error("No disruption found to add another consequence");
            }
            const currentIndex = validatedBody.data.consequenceIndex;
            const largestIndex = getLargestConsequenceIndex(disruption);
            const nextIndex = currentIndex >= largestIndex ? currentIndex + 1 : largestIndex + 1;

            redirectToWithQueryParams(
                req,
                res,
                [],
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/${nextIndex}`,
                isFromTemplate ? ["isFromTemplate=true"] : [],
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
            [],
            `${redirectPath}/${validatedBody.data.disruptionId}`,
            isFromTemplate ? ["isFromTemplate=true"] : [],
        );
        return;
    } catch (e) {
        if (e instanceof TooManyConsequencesError) {
            const body = req.body as NetworkConsequence;

            redirectToWithQueryParams(
                req,
                res,
                req.query.template === "true" ? ["template"] : [],
                `${CREATE_CONSEQUENCE_NETWORK_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                [],
            );

            return;
        }

        if (e instanceof Error) {
            const message = "There was a problem adding a consequence network.";
            redirectToError(res, message, "api.create-consequence-network", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createConsequenceNetwork;
