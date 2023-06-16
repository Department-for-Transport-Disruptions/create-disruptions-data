import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import { COOKIES_DISRUPTION_DETAIL_ERRORS, DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH } from "../../constants";
import {
    deleteDisruptionsInEdit,
    getDisruptionById,
    insertPublishedDisruptionIntoDynamoAndUpdateDraft,
    publishEditedConsequencesAndSocialMediaPosts,
    publishEditedConsequencesAndSocialMediaPostsIntoPending,
    publishPendingConsequencesAndSocialMediaPosts,
    deleteDisruptionsInPending,
    updatePendingDisruptionStatus,
    upsertSocialMediaPost,
} from "../../data/dynamo";
import { getParameter, putParameter } from "../../data/ssm";
import { publishDisruptionSchema, publishSchema } from "../../schemas/publish.schema";
import { flattenZodErrors } from "../../utils";
import { cleardownCookies, redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";
import { canPublish, delay, getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";
import { getPtSituationElementFromDraft } from "../../utils/siri";

const publishEdit = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const draftDisruption = await getDisruptionById(validatedBody.data.disruptionId, session.orgId);

        if (!draftDisruption || Object.keys(draftDisruption).length === 0) {
            logger.error(`Disruption ${validatedBody.data.disruptionId} not found to publish`);
            redirectTo(res, ERROR_PATH);

            return;
        }

        const validatedDisruptionBody = publishDisruptionSchema.safeParse(draftDisruption);

        if (!validatedDisruptionBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_DETAIL_ERRORS,
                JSON.stringify(flattenZodErrors(validatedDisruptionBody.error)),
                res,
            );

            redirectTo(res, `${DISRUPTION_DETAIL_PAGE_PATH}/${validatedBody.data.disruptionId}`);
            return;
        }

        const isEditPendingDsp =
            draftDisruption.publishStatus === PublishStatus.pendingAndEditing ||
            draftDisruption.publishStatus === PublishStatus.editPendingApproval;

        if (isEditPendingDsp) {
            await publishEditedConsequencesAndSocialMediaPostsIntoPending(draftDisruption.disruptionId, session.orgId);
        } else {
            await publishEditedConsequencesAndSocialMediaPosts(draftDisruption.disruptionId, session.orgId);
        }

        if (canPublish(session)) {
            if (isEditPendingDsp)
                await publishPendingConsequencesAndSocialMediaPosts(draftDisruption.disruptionId, session.orgId);
            await Promise.all([
                deleteDisruptionsInEdit(draftDisruption.disruptionId, session.orgId),
                deleteDisruptionsInPending(draftDisruption.disruptionId, session.orgId),
            ]);
        } else {
            await deleteDisruptionsInEdit(draftDisruption.disruptionId, session.orgId);
        }

        isEditPendingDsp && !canPublish(session)
            ? await updatePendingDisruptionStatus(
                  { ...draftDisruption, publishStatus: PublishStatus.editPendingApproval },
                  session.orgId,
              )
            : await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
                  getPtSituationElementFromDraft(draftDisruption),
                  draftDisruption,
                  session.orgId,
                  canPublish(session) ? PublishStatus.published : PublishStatus.pendingApproval,
                  session.name,
              );

        if (
            validatedDisruptionBody.data.socialMediaPosts &&
            validatedDisruptionBody.data.socialMediaPosts.length > 0 &&
            canPublish(session)
        ) {
            await Promise.all(
                validatedDisruptionBody.data.socialMediaPosts
                    .filter((s) => s.status === SocialMediaPostStatus.pending)
                    .map(async (socialMediaPost) => {
                        const refreshToken = await getParameter(
                            `/social/${session.orgId}/hootsuite/${socialMediaPost.socialAccount ?? ""}-${
                                session.name?.replace(" ", "_") || session.username
                            }`,
                        );

                        if (!refreshToken) {
                            await upsertSocialMediaPost(
                                {
                                    ...socialMediaPost,
                                    status: SocialMediaPostStatus.rejected,
                                },
                                session.orgId,
                            );
                            console.log("Refresh token is required when creating a social media post");
                        }
                        console.log("hello 1", refreshToken);
                        const clientId = await getParameter(`/social/hootsuite/client_id`);
                        const clientSecret = await getParameter(`/social/hootsuite/client_secret`);
                        if (!clientId || !clientSecret) {
                            await upsertSocialMediaPost(
                                {
                                    ...socialMediaPost,
                                    status: SocialMediaPostStatus.rejected,
                                },
                                session.orgId,
                            );
                            console.log("clientId and clientSecret must be defined");
                        }

                        const credentials = `${clientId.Parameter?.Value || ""}:${clientSecret.Parameter?.Value || ""}`;

                        const authToken = `Basic ${Buffer.from(credentials).toString("base64")}`;
                        console.log("test", authToken);

                        const responseToken = await fetch(`https://platform.hootsuite.com/oauth2/token`, {
                            method: "POST",
                            body: new URLSearchParams({
                                grant_type: "refresh_token",
                                refresh_token: refreshToken.Parameter?.Value ?? "",
                            }),
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                Authorization: authToken,
                            },
                        });

                        console.log(session.name, "name");
                        // const t1 = await responseToken.json();
                        console.log("hello 2");
                        if (responseToken.ok) {
                            const tokenResult = await responseToken.json();
                            const key = `/social/${session.orgId}/hootsuite/${socialMediaPost.socialAccount ?? ""}-${
                                session.name?.replace(" ", "_") || session.username
                            }`;
                            console.log(key);
                            await putParameter(key, tokenResult.refresh_token ?? "", "SecureString", true);

                            let imageLink = { id: "", url: "" };
                            let canUpload = false;
                            console.log("here");
                            if (socialMediaPost.image) {
                                console.log("hello 3");
                                const responseImage = await fetch(`https://platform.hootsuite.com/v1/media`, {
                                    method: "POST",
                                    body: JSON.stringify({
                                        sizeBytes: socialMediaPost.image.size,
                                        mimeType: socialMediaPost.image.mimetype,
                                    }),
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                                    },
                                });
                                console.log("hello 4");
                                if (responseImage.ok) {
                                    console.log("hello 5");
                                    const image = await responseImage.json();
                                    const imageContents = await readFile(socialMediaPost.image.filepath || "");
                                    imageLink = { url: image.data.uploadUrl, id: image.data.id };

                                    const uploadResponse = await fetch(imageLink.url, {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": socialMediaPost.image.mimetype,
                                        },
                                        body: imageContents,
                                    });
                                    if (uploadResponse.ok) {
                                        console.log("hello 6");
                                        for (let i = 0; i < 3; i++) {
                                            const imageStatus = await fetch(
                                                `https://platform.hootsuite.com/v1/media/${imageLink.id}`,
                                                {
                                                    method: "GET",
                                                    headers: {
                                                        Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                                                    },
                                                },
                                            );
                                            if (imageStatus.ok) {
                                                const imageState = await imageStatus.json();

                                                if (imageState.data.state === "READY") {
                                                    canUpload = true;

                                                    break;
                                                } else {
                                                    await delay(1000);
                                                }
                                            } else {
                                                await upsertSocialMediaPost(
                                                    {
                                                        ...socialMediaPost,
                                                        status: SocialMediaPostStatus.rejected,
                                                    },
                                                    session.orgId,
                                                );
                                                console.log("Cannot retrieve media details from hootsuite");
                                            }
                                        }
                                        if (!canUpload) {
                                            await delay(5000);
                                            canUpload = true;
                                        }
                                    } else {
                                        await upsertSocialMediaPost(
                                            {
                                                ...socialMediaPost,
                                                status: SocialMediaPostStatus.rejected,
                                            },
                                            session.orgId,
                                        );
                                        console.log("Cannot upload image to hootsuite");
                                    }
                                } else {
                                    await upsertSocialMediaPost(
                                        {
                                            ...socialMediaPost,
                                            status: SocialMediaPostStatus.rejected,
                                        },
                                        session.orgId,
                                    );
                                    console.log("Cannot retrieve upload url from hootsuite");
                                }
                            }

                            const formattedDate = dayjs(
                                `${socialMediaPost.publishDate} ${socialMediaPost.publishTime}`,
                                "DD/MM/YYYY HHmm",
                            ).toISOString();

                            const createSocialPostResponse = await fetch(`https://platform.hootsuite.com/v1/messages`, {
                                method: "POST",
                                body: JSON.stringify({
                                    text: socialMediaPost.messageContent,
                                    scheduledSendTime: formattedDate,
                                    socialProfileIds: [socialMediaPost.hootsuiteProfile],
                                    ...(imageLink.id ? { media: [{ id: imageLink.id }] } : {}),
                                }),
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                                },
                            });

                            if (!createSocialPostResponse.ok) {
                                console.log("hello 5");
                                // const js = await createSocialPostResponse.json();
                                // console.log(JSON.stringify(js));
                                await upsertSocialMediaPost(
                                    {
                                        ...socialMediaPost,
                                        status: SocialMediaPostStatus.rejected,
                                    },
                                    session.orgId,
                                );
                                console.log("Failed to create social media post");
                            } else {
                                //put into dynamo for that social media the updated status
                                await upsertSocialMediaPost(
                                    {
                                        ...socialMediaPost,
                                        status: SocialMediaPostStatus.successful,
                                    },
                                    session.orgId,
                                );
                            }
                        } else {
                            await upsertSocialMediaPost(
                                {
                                    ...socialMediaPost,
                                    status: SocialMediaPostStatus.rejected,
                                },
                                session.orgId,
                            );
                            console.log("Could not retrieve token from Hootsuite");
                        }
                    }),
            );
        }
        cleardownCookies(req, res);

        redirectTo(res, "/dashboard");
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem publishing the edited disruption.";
            redirectToError(res, message, "api.publish-edit", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default publishEdit;
