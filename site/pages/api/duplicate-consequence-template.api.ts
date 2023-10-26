import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_REVIEW_TEMPLATE_ERRORS,
    COOKIES_TEMPLATE_OVERVIEW_ERRORS,
    REVIEW_TEMPLATE_PAGE_PATH,
    TEMPLATE_OVERVIEW_PAGE_PATH,
} from "../../constants";
import { getTemplateById } from "../../data/dynamo";
import { TooManyConsequencesError } from "../../errors";
import { duplicateConsequenceSchema } from "../../schemas/consequence.schema";
import { getLargestConsequenceIndex } from "../../utils";
import { handleUpsertConsequence, redirectToError, redirectToWithQueryParams } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const duplicateConsequence = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { consequenceId, isFromTemplate } = req.query;

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

        const template = await getTemplateById(validatedBody.data.disruptionId, session.orgId);

        if (!template || !template.consequences) {
            throw new Error("No template / template with consequences found");
        }

        const consequenceToDuplicate = template.consequences.find(
            (consequence) => consequence.consequenceIndex === Number(consequenceId),
        );

        if (!consequenceToDuplicate) {
            throw new Error("No consequence found to duplicate");
        }

        await handleUpsertConsequence(
            {
                ...consequenceToDuplicate,
                consequenceIndex: getLargestConsequenceIndex(template) + 1,
            },
            session.orgId,
            session.isOrgStaff,
            true,
            req.body as Consequence,
            template.publishStatus !== PublishStatus.draft
                ? COOKIES_TEMPLATE_OVERVIEW_ERRORS
                : COOKIES_REVIEW_TEMPLATE_ERRORS,
            res,
        );

        redirectToWithQueryParams(
            req,
            res,
            [],
            `${
                template.publishStatus === PublishStatus.draft ? REVIEW_TEMPLATE_PAGE_PATH : TEMPLATE_OVERVIEW_PAGE_PATH
            }/${validatedBody.data.disruptionId}`,
            isFromTemplate ? ["isFromTemplate=true"] : [],
        );

        return;
    } catch (e) {
        if (e instanceof TooManyConsequencesError) {
            const body = req.body as Consequence;

            const { isFromTemplate } = req.query;

            redirectToWithQueryParams(
                req,
                res,
                [],
                `${req.query.return as string}/${body.disruptionId}`,
                isFromTemplate ? ["isFromTemplate=true"] : [],
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
