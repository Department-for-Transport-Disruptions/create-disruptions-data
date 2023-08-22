import { disruptionInfoSchemaRefined } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import cryptoRandomString from "crypto-random-string";
import { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import { getDisruptionById, upsertConsequence, upsertDisruptionInfo } from "../../data/dynamo";
import { FullDisruption } from "../../schemas/disruption.schema";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const duplicateDisruption = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { disruptionId } = req.body as { disruptionId: string };

        if (!disruptionId) {
            throw new Error("No disruptionId found");
        }

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const disruptionToDuplicate = await getDisruptionById(disruptionId, session.orgId);

        if (!disruptionToDuplicate) {
            throw new Error("No disruption to duplicate");
        }

        const validatedDisruptionBody = disruptionInfoSchemaRefined.safeParse({
            ...disruptionToDuplicate,
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
            ...(disruptionToDuplicate.consequences
                ? {
                      consequences: disruptionToDuplicate.consequences.map((c) => ({
                          ...c,
                          disruptionId: newDisruptionId,
                      })),
                  }
                : {}),
            ...(disruptionToDuplicate.socialMediaPosts
                ? {
                      socialMediaPosts: disruptionToDuplicate.socialMediaPosts.map((s) => ({
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

        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${newDisruptionId}?duplicate=true`);

        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem duplicating a disruption.";
            redirectToError(res, message, "api.duplicate-disruption", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default duplicateDisruption;
