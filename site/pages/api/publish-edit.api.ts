import { NextApiRequest, NextApiResponse } from "next";
import { getPtSituationElementFromDraft } from "./publish.api";
import { ERROR_PATH } from "../../constants";
import {
    getDisruptionById,
    insertPublishedDisruptionIntoDynamoAndUpdateDraft,
    publishEditedConsequences,
} from "../../data/dynamo";
import { publishSchema } from "../../schemas/publish.schema";
import { cleardownCookies, redirectTo, redirectToError } from "../../utils/apiUtils";
import logger from "../../utils/logger";

const publishEdit = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);

        if (!validatedBody.success) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const draftDisruption = await getDisruptionById(validatedBody.data.disruptionId);

        if (!draftDisruption) {
            logger.error(`Disruption ${validatedBody.data.disruptionId} not found to publish`);
            redirectTo(res, ERROR_PATH);

            return;
        }

        await publishEditedConsequences(draftDisruption.disruptionId);

        await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
            getPtSituationElementFromDraft(draftDisruption),
            draftDisruption.disruptionId,
        );

        cleardownCookies(req, res);

        redirectTo(res, "/dashboard");
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.publish-edit", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default publishEdit;
