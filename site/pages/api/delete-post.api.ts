import { NextApiRequest, NextApiResponse } from "next";
import { DISRUPTION_DETAIL_PAGE_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import { removeSocialMediaPostFromDisruption, upsertSocialMediaPost } from "../../data/dynamo";
import { SocialMediaPostTransformed as SocialMediaPost } from "../../schemas/social-media.schema";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const deleteConsequence = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
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

        if (inEdit) {
            const socialMediaPost: Pick<SocialMediaPost, "disruptionId" | "socialMediaPostIndex"> & {
                isDeleted: boolean;
            } = {
                disruptionId: disruptionId,
                socialMediaPostIndex: Number(id),
                isDeleted: true,
            };
            await upsertSocialMediaPost(socialMediaPost, session.orgId, session.isOrgStaff);

            redirectTo(res, `${DISRUPTION_DETAIL_PAGE_PATH}/${disruptionId}`);
            return;
        } else {
            await removeSocialMediaPostFromDisruption(Number(id), disruptionId, session.orgId);
        }

        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${disruptionId}`);
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

export default deleteConsequence;
