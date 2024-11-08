import { NextApiRequest, NextApiResponse } from "next";
import { DISRUPTION_DETAIL_PAGE_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import { removeSocialMediaPostFromDisruption } from "../../data/db";
import { redirectToError, redirectToWithQueryParams } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const deletePost = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const body = req.body as {
            id: string | undefined;
            disruptionId: string | undefined;
            inEdit?: string | undefined;
        };

        const { template } = req.query;
        const id = body?.id;
        const disruptionId = body?.disruptionId;
        const inEdit = body?.inEdit;

        if (!id || Array.isArray(id)) {
            throw new Error(
                `Insufficient data provided for deleting a socialMediaPost by id: ${id ? id.toString() : "undefined"}`,
            );
        }
        if (!disruptionId || Array.isArray(disruptionId)) {
            throw new Error(
                `Disruption id is required, in the correct format, to delete a socialMediaPost: ${
                    disruptionId ? disruptionId.toString() : "undefined"
                }`,
            );
        }

        await removeSocialMediaPostFromDisruption(Number(id), disruptionId, session.orgId, session.isOrgStaff, false);

        if (inEdit) {
            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${DISRUPTION_DETAIL_PAGE_PATH}/${disruptionId}`,
            );

            return;
        }

        redirectToWithQueryParams(
            req,
            res,
            template ? ["template"] : [],
            `${REVIEW_DISRUPTION_PAGE_PATH}/${disruptionId}`,
        );
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem deleting the socialMediaPost";
            redirectToError(res, message, "api.delete-socialMediaPost", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default deletePost;
