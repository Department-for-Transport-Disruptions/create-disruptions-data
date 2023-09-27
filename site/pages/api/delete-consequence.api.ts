import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { NextApiRequest, NextApiResponse } from "next";
import { DISRUPTION_DETAIL_PAGE_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import { removeConsequenceFromDisruption, upsertConsequence } from "../../data/dynamo";
import { redirectToError, redirectToWithQueryParams } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const deleteConsequence = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const { template } = req.query;

        const body = req.body as {
            id: string | undefined;
            disruptionId: string | undefined;
            inEdit?: string | undefined;
        };

        const id = body?.id;
        const disruptionId = body?.disruptionId;
        const inEdit = body?.inEdit;

        if (!id || Array.isArray(id)) {
            throw new Error(
                `Insufficient data provided for deleting a consequence by id: ${id ? id.toString() : "undefined"}`,
            );
        }
        if (!disruptionId || Array.isArray(disruptionId)) {
            throw new Error(
                `Disruption id is required, in the correct format, to delete a consequence: ${
                    disruptionId ? disruptionId.toString() : "undefined"
                }`,
            );
        }

        if (inEdit) {
            const consequence: Pick<Consequence, "disruptionId" | "consequenceIndex"> & { isDeleted: boolean } = {
                disruptionId: disruptionId,
                consequenceIndex: Number(id),
                isDeleted: true,
            };
            await upsertConsequence(consequence, session.orgId, session.isOrgStaff, template === "true");
            redirectToWithQueryParams(
                req,
                res,
                template === "true" ? ["template"] : [],
                `${DISRUPTION_DETAIL_PAGE_PATH}/${disruptionId}`,
            );
            return;
        } else {
            await removeConsequenceFromDisruption(Number(id), disruptionId, session.orgId, template === "true");
        }

        redirectToWithQueryParams(
            req,
            res,
            template === "true" ? ["template"] : [],
            `${REVIEW_DISRUPTION_PAGE_PATH}/${disruptionId}`,
        );
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem deleting the consequence";
            redirectToError(res, message, "api.delete-consequence", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default deleteConsequence;
