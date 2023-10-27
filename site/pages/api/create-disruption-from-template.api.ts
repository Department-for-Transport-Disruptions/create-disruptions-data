import { disruptionInfoSchemaRefined } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import cryptoRandomString from "crypto-random-string";
import { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { CREATE_DISRUPTION_PAGE_PATH } from "../../constants";
import { getTemplateById, upsertConsequence, upsertDisruptionInfo, upsertSocialMediaPost } from "../../data/dynamo";
import { FullDisruption } from "../../schemas/disruption.schema";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import { defaultDateTime } from "../../utils/dates";

const createDisruptionFromTemplate = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { templateId } = req.query;

        if (!templateId) {
            throw new Error("Template id is required");
        }

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const templateToMakeDisruption = await getTemplateById(templateId as string, session.orgId);

        if (!templateToMakeDisruption) {
            throw new Error("No disruption to duplicate");
        }

        const validatedDisruptionBody = disruptionInfoSchemaRefined.safeParse({
            ...templateToMakeDisruption,
            orgId: session.orgId,
        });

        if (!validatedDisruptionBody.success) {
            throw new Error("Invalid disruption information");
        }

        const newDisruptionId = randomUUID();

        const displayId = cryptoRandomString({ length: 6 });
        const draftDisruption: FullDisruption = {
            ...validatedDisruptionBody.data,
            publishStatus: PublishStatus.draft,
            disruptionId: newDisruptionId,
            displayId,
            ...(templateToMakeDisruption.consequences
                ? {
                      consequences: templateToMakeDisruption.consequences.map((c) => ({
                          ...c,
                          disruptionId: newDisruptionId,
                      })),
                  }
                : {}),
            ...(templateToMakeDisruption.socialMediaPosts
                ? {
                      socialMediaPosts: templateToMakeDisruption.socialMediaPosts.map((s) => ({
                          ...s,
                          disruptionId: newDisruptionId,
                      })),
                  }
                : {}),
        };

        if (!draftDisruption.disruptionNoEndDateTime) {
            draftDisruption.disruptionNoEndDateTime = "";
        }

        await upsertDisruptionInfo(
            {
                ...validatedDisruptionBody.data,
                disruptionId: newDisruptionId,
                displayId,
            },
            session.orgId,
            session.isOrgStaff,
        );

        if (draftDisruption.consequences) {
            await Promise.all(
                draftDisruption.consequences.map(async (consequence) => {
                    await upsertConsequence(consequence, session.orgId, session.isOrgStaff);
                }),
            );
        }

        if (draftDisruption.socialMediaPosts) {
            await Promise.all(
                draftDisruption.socialMediaPosts.map(async (socialMediaPost) => {
                    await upsertSocialMediaPost(
                        {
                            ...socialMediaPost,
                            ...(socialMediaPost.accountType === "Hootsuite"
                                ? { publishDate: socialMediaPost.publishDate || defaultDateTime().date }
                                : {}),
                            ...(socialMediaPost.accountType === "Hootsuite"
                                ? { publishTime: socialMediaPost.publishTime || defaultDateTime().time }
                                : {}),
                        },
                        session.orgId,
                        session.isOrgStaff,
                    );
                }),
            );
        }

        redirectTo(res, `${CREATE_DISRUPTION_PAGE_PATH}/${newDisruptionId}?isFromTemplate=true`);

        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption from template.";
            redirectToError(res, message, "api.create-disruption-from-template", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createDisruptionFromTemplate;
