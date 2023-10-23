import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_DISRUPTION_DETAIL_ERRORS, COOKIES_REVIEW_DISRUPTION_ERRORS } from "../../constants";
import { getDisruptionById } from "../../data/dynamo";
import { TooManyConsequencesError } from "../../errors";
import { duplicateConsequenceSchema } from "../../schemas/consequence.schema";
import { getLargestConsequenceIndex } from "../../utils";
import {
    getReturnPage,
    handleUpsertConsequence,
    isDisruptionFromTemplate,
    redirectToError,
    redirectToWithQueryParams,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const duplicateConsequence = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { consequenceId } = req.query;

        if (!req.query.return) {
            throw new Error("return path required");
        }

        const { template } = req.query;
        const validatedBody = duplicateConsequenceSchema.safeParse(req.body);

        if (!consequenceId) {
            throw new Error("consequenceId is required to duplicate a consequence");
        }

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        if (!validatedBody.success) {
            throw new Error("disruptionId is required to duplicate a consequence");
        }

        const disruption = await getDisruptionById(
            validatedBody.data.disruptionId,
            session.orgId,
            !!req.query?.template,
        );

        if (!disruption || !disruption.consequences) {
            throw new Error("No disruption / disruption with consequences found");
        }

        const consequenceToDuplicate = disruption.consequences.find(
            (consequence) => consequence.consequenceIndex === Number(consequenceId),
        );

        if (!consequenceToDuplicate) {
            throw new Error("No consequence found to duplicate");
        }

        await handleUpsertConsequence(
            {
                ...consequenceToDuplicate,
                consequenceIndex: getLargestConsequenceIndex(disruption) + 1,
            },
            session.orgId,
            session.isOrgStaff,
            template === "true",
            req.body as Consequence,
            req.query.return.toString().includes("disruption-detail")
                ? COOKIES_DISRUPTION_DETAIL_ERRORS
                : COOKIES_REVIEW_DISRUPTION_ERRORS,
            res,
        );

        redirectToWithQueryParams(
            req,
            res,
            template === "true" ? ["template"] : [],
            `${req.query.return as string}/${validatedBody.data.disruptionId}`,
        );

        return;
    } catch (e) {
        if (e instanceof TooManyConsequencesError) {
            const body = req.body as Consequence;
            const queryParam = getReturnPage(req);

            redirectToWithQueryParams(
                req,
                res,
                isDisruptionFromTemplate(req) ? ["template"] : [],
                `${req.query.return as string}/${body.disruptionId}`,
                queryParam ? [queryParam] : [],
            );

            return;
        }

        if (e instanceof Error) {
            const message = "There was a problem duplicating a consequence.";
            redirectToError(res, message, "api.duplicate-consequence", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default duplicateConsequence;
