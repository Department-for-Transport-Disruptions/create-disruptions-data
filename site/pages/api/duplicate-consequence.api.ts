import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { DISRUPTION_DETAIL_PAGE_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import { getDisruptionById, upsertConsequence } from "../../data/dynamo";
import { duplicateConsequenceSchema } from "../../schemas/consequence.schema";
import { redirectToError, redirectToWithQueryParams } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const duplicateConsequence = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { consequenceId } = req.query;

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

        await upsertConsequence(
            {
                ...consequenceToDuplicate,
                consequenceIndex:
                    disruption.consequences && disruption.consequences.length > 0
                        ? disruption.consequences.reduce(
                              (max, c) => (c.consequenceIndex > max ? c.consequenceIndex : max),
                              disruption.consequences[0].consequenceIndex,
                          ) + 1
                        : 0,
            },
            session.orgId,
            session.isOrgStaff,
            template === "true",
        );

        redirectToWithQueryParams(
            req,
            res,
            template === "true" ? ["template"] : [],
            `${
                disruption.publishStatus === PublishStatus.draft
                    ? REVIEW_DISRUPTION_PAGE_PATH
                    : DISRUPTION_DETAIL_PAGE_PATH
            }/${validatedBody.data.disruptionId}`,
        );
        return;
    } catch (e) {
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
