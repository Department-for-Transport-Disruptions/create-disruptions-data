import { inspect } from "util";
import {
    Consequence,
    ConsequenceOperators,
    Disruption,
    DisruptionInfo,
    Service,
    Stop,
    Validity,
} from "@create-disruptions-data/shared-ts/disruptionTypes";
import { History, MAX_CONSEQUENCES, disruptionSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { getDate, isCurrentOrUpcomingDisruption } from "@create-disruptions-data/shared-ts/utils/dates";
import { getDbClient } from "@create-disruptions-data/shared-ts/utils/db";
import { makeFilteredArraySchema } from "@create-disruptions-data/shared-ts/utils/zod";
import { TooManyConsequencesError } from "../errors";
import { FullDisruption, fullDisruptionSchema } from "../schemas/disruption.schema";
import { SocialMediaPost, SocialMediaPostTransformed } from "../schemas/social-media.schema";
import {
    flattenZodErrors,
    isNetworkConsequence,
    isOperatorConsequence,
    isServicesConsequence,
    isStopsConsequence,
    notEmpty,
} from "../utils";
import logger from "../utils/logger";

const dbClient = getDbClient();

declare global {
    namespace PrismaJson {
        // you can use classes, interfaces, types, etc.
        type PrismaValidity = Validity;
        type PrismaHistory = History;
        type PrismaService = Service;
        type PrismaStop = Stop;
        type PrismaSocalMedia = SocialMediaPost;
        type PrismaOperators = ConsequenceOperators;
    }
}

export const getPendingDisruptionsIdsFromDynamo = async (id: string): Promise<string[]> => {
    logger.info("Getting disruptions in pending status from database...");

    const disruptions = await dbClient.disruptions.findMany({
        where: {
            orgId: id,
            publishStatus: PublishStatus.pendingApproval || PublishStatus.editPendingApproval,
        },
        select: {
            id: true,
        },
    });

    return disruptions.map((d) => d.id);
};

export const getPublishedDisruptionsDataFromDynamo = async (id: string): Promise<FullDisruption[]> => {
    logger.info("Getting disruptions data from database...");

    const disruptions = await dbClient.disruptions.findMany({
        where: {
            orgId: id,
            publishStatus: PublishStatus.published,
        },
        include: {
            consequences: true,
        },
    });

    return makeFilteredArraySchema(fullDisruptionSchema).parse(disruptions);
};

export const getDisruptionsDataFromDynamo = async (
    id: string,
    isTemplate = false,
    pageSize?: number,
    offset?: number,
): Promise<FullDisruption[]> => {
    logger.info(`Getting disruptions data from database for org ${id}...`);

    const disruptions = await dbClient.disruptions.findMany({
        where: {
            orgId: id,
            template: isTemplate,
        },
        include: {
            consequences: true,
        },
        take: pageSize ?? 10,
        skip: offset ?? 0,
    });

    const editedDisruptions = await dbClient.disruptionsEdited.findMany({
        where: {
            id: {
                in: disruptions.map((d) => d.id),
            },
        },
        include: {
            consequences: true,
        },
    });

    const disruptionsToUse = disruptions.map((d) => editedDisruptions.find((e) => e.id === d.id) ?? d);

    return makeFilteredArraySchema(fullDisruptionSchema).parse(disruptionsToUse);
};

export const getPublishedSocialMediaPosts = async (orgId: string): Promise<SocialMediaPost[]> => {
    logger.info("Getting published social media data from DynamoDB table...");

    const disruptions = await getPublishedDisruptionsDataFromDynamo(orgId);

    const currentAndUpcomingDisruptions = disruptions.filter((disruption) =>
        isCurrentOrUpcomingDisruption(disruption.publishEndDate, disruption.publishEndTime),
    );

    return currentAndUpcomingDisruptions.flatMap((item) => item.socialMediaPosts).filter(notEmpty);
};

export const deletePublishedDisruption = async (disruptionId: string, id: string) => {
    logger.info(`Deleting published disruption (${disruptionId})...`);

    await Promise.all([
        dbClient.disruptions.delete({
            where: {
                id: disruptionId,
                orgId: id,
            },
        }),
        dbClient.disruptionsEdited.delete({
            where: {
                id: disruptionId,
                orgId: id,
            },
        }),
    ]);
};

export const removeConsequenceFromDisruption = async (
    index: number,
    disruptionId: string,
    orgId: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
) => {
    logger.info(`Updating consequence ${index} in disruption (${disruptionId})...`);

    const currentDisruption = await getDisruptionById(disruptionId, orgId);
    const isPending =
        isUserStaff &&
        !isTemplate &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    const editedConsequences = currentDisruption?.consequences?.filter((c) => c.consequenceIndex !== index);

    if (isEditing) {
        const consequencesToInsert = editedConsequences?.map(({ disruptionId, ...rest }) => ({ ...rest }));

        await dbClient.disruptionsEdited.upsert({
            where: {
                id: disruptionId,
                orgId,
            },
            create: {
                ...currentDisruption,
                id: disruptionId,
                orgId,
                creationTime: currentDisruption.creationTime,
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                consequences: {
                    createMany: {
                        data: consequencesToInsert ?? [],
                    },
                },
            },
            update: {
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                consequences: {
                    delete: {
                        disruptionId_consequenceIndex: {
                            disruptionId,
                            consequenceIndex: index,
                        },
                    },
                },
            },
        });
    } else {
        await dbClient.consequences.delete({
            where: {
                disruptionId_consequenceIndex: {
                    disruptionId,
                    consequenceIndex: index,
                },
            },
        });
    }
};

export const getDisruptionById = async (disruptionId: string, id: string): Promise<FullDisruption | null> => {
    logger.info(`Retrieving (${disruptionId})...`);

    let disruption = await dbClient.disruptionsEdited.findFirst({
        where: {
            id: disruptionId,
            orgId: id,
        },
        include: {
            consequences: true,
        },
    });

    if (!disruption) {
        disruption = await dbClient.disruptions.findFirst({
            where: {
                id: disruptionId,
                orgId: id,
            },
            include: {
                consequences: true,
            },
        });
    }

    if (!disruption) {
        return null;
    }

    const parsedDisruption = fullDisruptionSchema.safeParse(disruption);

    if (!parsedDisruption.success) {
        logger.warn(inspect(flattenZodErrors(parsedDisruption.error)));
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        return null;
    }

    return parsedDisruption.data;
};

export const insertPublishedDisruptionIntoDynamoAndUpdateDraft = async (
    disruption: FullDisruption,
    id: string,
    status: PublishStatus,
    user: string,
    history?: string,
) => {
    logger.info(`Inserting published disruption (${disruption.id})...`);

    const currentTime = getDate();

    const historyItems = disruption.newHistory ?? [];

    if (history) {
        historyItems.push(history);
    }

    const fullHistory: History[] = [
        ...(disruption.history ?? []),
        {
            datetime: currentTime.toISOString(),
            historyItems,
            status,
            user,
        },
    ];

    await dbClient.disruptions.update({
        where: {
            id: disruption.id,
            orgId: id,
        },
        data: {
            publishStatus: status,
            history: fullHistory,
        },
    });
};

export const updatePendingDisruptionStatus = async (disruption: Disruption, id: string) => {
    logger.info(`Updating status of pending disruption (${disruption.id})...`);

    await dbClient.disruptionsEdited.update({
        where: {
            id: disruption.id,
            orgId: id,
        },
        data: {
            publishStatus: PublishStatus.editPendingApproval,
        },
    });
};

export const upsertDisruptionInfo = async (
    disruptionInfo: DisruptionInfo,
    id: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
    operatorOrgId?: string | null,
) => {
    logger.info(`Upserting disruption (${disruptionInfo.id})...`);

    const currentDisruption = await getDisruptionById(disruptionInfo.id, id);
    const isPending =
        isUserStaff &&
        !isTemplate &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    if (isEditing) {
        const consequences = currentDisruption.consequences?.map(({ disruptionId, ...rest }) => ({ ...rest }));

        await dbClient.disruptionsEdited.upsert({
            where: {
                id: disruptionInfo.id,
            },
            update: {
                ...disruptionInfo,
                creationTime: currentDisruption.creationTime,
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
            },
            create: {
                ...disruptionInfo,
                orgId: id,
                creationTime: currentDisruption.creationTime,
                consequences: {
                    createMany: {
                        data: consequences || [],
                    },
                },
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
            },
        });
    } else {
        await dbClient.disruptions.upsert({
            where: {
                id: disruptionInfo.id,
                orgId: id,
            },
            create: {
                id: disruptionInfo.id,
                orgId: id,
                displayId: disruptionInfo.displayId,
                associatedLink: disruptionInfo.associatedLink,
                description: disruptionInfo.description,
                summary: disruptionInfo.summary,
                publishStartDate: disruptionInfo.publishStartDate,
                publishStartTime: disruptionInfo.publishStartTime,
                publishEndDate: disruptionInfo.publishEndDate,
                publishEndTime: disruptionInfo.publishEndTime,
                disruptionStartDate: disruptionInfo.disruptionStartDate,
                disruptionStartTime: disruptionInfo.disruptionStartTime,
                disruptionEndDate: disruptionInfo.disruptionEndDate,
                disruptionEndTime: disruptionInfo.disruptionEndTime,
                disruptionNoEndDateTime: disruptionInfo.disruptionNoEndDateTime,
                disruptionRepeats: disruptionInfo.disruptionRepeats,
                disruptionRepeatsEndDate: disruptionInfo.disruptionRepeatsEndDate,
                disruptionReason: disruptionInfo.disruptionReason,
                disruptionType: disruptionInfo.disruptionType,
                createdByOperatorOrgId: operatorOrgId,
                validity: disruptionInfo.validity,
                publishStatus: PublishStatus.draft,
            },
            update: {
                displayId: disruptionInfo.displayId,
                associatedLink: disruptionInfo.associatedLink,
                description: disruptionInfo.description,
                summary: disruptionInfo.summary,
                publishStartDate: disruptionInfo.publishStartDate,
                publishStartTime: disruptionInfo.publishStartTime,
                publishEndDate: disruptionInfo.publishEndDate,
                publishEndTime: disruptionInfo.publishEndTime,
                disruptionStartDate: disruptionInfo.disruptionStartDate,
                disruptionStartTime: disruptionInfo.disruptionStartTime,
                disruptionEndDate: disruptionInfo.disruptionEndDate,
                disruptionEndTime: disruptionInfo.disruptionEndTime,
                disruptionNoEndDateTime: disruptionInfo.disruptionNoEndDateTime,
                disruptionRepeats: disruptionInfo.disruptionRepeats,
                disruptionRepeatsEndDate: disruptionInfo.disruptionRepeatsEndDate,
                disruptionReason: disruptionInfo.disruptionReason,
                disruptionType: disruptionInfo.disruptionType,
                createdByOperatorOrgId: operatorOrgId,
                validity: disruptionInfo.validity,
                publishStatus: PublishStatus.draft,
            },
        });
    }
};

export const upsertConsequence = async (
    consequence: Consequence,
    id: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
): Promise<FullDisruption | null> => {
    logger.info(
        `Updating consequence index ${consequence.consequenceIndex || ""} in disruption (${
            consequence.disruptionId || ""
        })...`,
    );
    const currentDisruption = await getDisruptionById(consequence.disruptionId, id);

    if (
        !currentDisruption?.consequences?.find((c) => c.consequenceIndex === consequence.consequenceIndex) &&
        currentDisruption?.consequences &&
        currentDisruption.consequences.length >= MAX_CONSEQUENCES
    ) {
        throw new TooManyConsequencesError();
    }

    const isPending =
        isUserStaff &&
        !isTemplate &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    const consequenceToInsert = {
        consequenceIndex: consequence.consequenceIndex,
        consequenceType: consequence.consequenceType,
        description: consequence.description,
        disruptionSeverity: consequence.disruptionSeverity,
        removeFromJourneyPlanners: consequence.removeFromJourneyPlanners,
        vehicleMode: consequence.vehicleMode,
        disruptionDelay: consequence.disruptionDelay,
        disruptionDirection: isServicesConsequence(consequence) ? consequence.disruptionDirection : null,
        services: isServicesConsequence(consequence) ? consequence.services : [],
        stops: isServicesConsequence(consequence) || isStopsConsequence(consequence) ? consequence.stops : [],
        consequenceOperators: isOperatorConsequence(consequence) ? consequence.consequenceOperators : undefined,
        disruptionArea: isNetworkConsequence(consequence) ? consequence.disruptionArea : undefined,
    };

    if (isEditing) {
        const currentConsequences = currentDisruption.consequences?.map(({ disruptionId, ...rest }) => ({ ...rest }));
        const consequencesToInsert = currentConsequences?.map((c) => {
            if (c.consequenceIndex === consequenceToInsert.consequenceIndex) {
                return consequenceToInsert;
            }

            return c;
        });

        await dbClient.disruptionsEdited.upsert({
            where: {
                id: consequence.disruptionId,
                orgId: id,
            },
            create: {
                ...currentDisruption,
                orgId: id,
                creationTime: currentDisruption.creationTime,
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                consequences: {
                    createMany: {
                        data: consequencesToInsert || [],
                    },
                },
            },
            update: {
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                consequences: {
                    upsert: {
                        where: {
                            disruptionId_consequenceIndex: {
                                disruptionId: consequence.disruptionId,
                                consequenceIndex: consequence.consequenceIndex,
                            },
                        },
                        create: {
                            ...consequenceToInsert,
                        },
                        update: {
                            ...consequenceToInsert,
                        },
                    },
                },
            },
        });
    } else {
        await dbClient.disruptions.update({
            where: {
                id: consequence.disruptionId,
                orgId: id,
            },
            data: {
                consequences: {
                    upsert: {
                        where: {
                            disruptionId_consequenceIndex: {
                                disruptionId: consequence.disruptionId,
                                consequenceIndex: consequence.consequenceIndex,
                            },
                        },
                        create: consequenceToInsert,
                        update: consequenceToInsert,
                    },
                },
            },
        });
    }

    return currentDisruption;
};

export const upsertSocialMediaPost = async (
    socialMediaPost: SocialMediaPostTransformed,
    id: string,
    isUserStaff?: boolean,
) => {
    logger.info(`Updating socialMediaPost index ${socialMediaPost.socialMediaPostIndex} in disruption (${id})...`);

    const currentDisruption = await getDisruptionById(socialMediaPost.disruptionId, id);
    const currentSocialMediaPosts = currentDisruption?.socialMediaPosts;
    const existingSocialMediaPostIndex = currentSocialMediaPosts?.findIndex(
        (post) => post.socialMediaPostIndex === socialMediaPost.socialMediaPostIndex,
    );
    const newSocialMediaPosts = [...(currentSocialMediaPosts ?? [])];

    if (existingSocialMediaPostIndex && newSocialMediaPosts[existingSocialMediaPostIndex]) {
        newSocialMediaPosts[existingSocialMediaPostIndex] = socialMediaPost;
    } else {
        newSocialMediaPosts.push(socialMediaPost);
    }

    const isPending =
        isUserStaff &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    if (isEditing) {
        await dbClient.disruptionsEdited.upsert({
            where: {
                id: socialMediaPost.disruptionId,
                orgId: id,
            },
            create: {
                ...currentDisruption,
                id: currentDisruption.id,
                orgId: id,
                creationTime: currentDisruption.creationTime,
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                consequences: {
                    createMany: {
                        data: [...(currentDisruption.consequences ?? [])],
                    },
                },
                socialMediaPosts: newSocialMediaPosts,
            },
            update: {},
        });
    }
};

export const removeSocialMediaPostFromDisruption = async (index: number, disruptionId: string, id: string) => {
    logger.info(`Removing socialMediaPost ${index} in disruption (${disruptionId})...`);

    const currentDisruption = await getDisruptionById(disruptionId, id);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    const currentSocialMediaPosts = currentDisruption?.socialMediaPosts;
    const newSocialMediaPosts = currentSocialMediaPosts?.filter((post) => post.socialMediaPostIndex !== index);

    if (isEditing) {
        dbClient.disruptionsEdited.update({
            where: {
                id: disruptionId,
                orgId: id,
            },
            data: {
                socialMediaPosts: newSocialMediaPosts,
            },
        });
    } else {
        dbClient.disruptions.update({
            where: {
                id: disruptionId,
                orgId: id,
            },
            data: {
                socialMediaPosts: newSocialMediaPosts,
            },
        });
    }
};

export const publishEditedConsequencesAndSocialMediaPosts = async (disruptionId: string, id: string) => {
    logger.info(`Publishing edited disruption ${disruptionId}...`);

    await dbClient.$transaction(async (tx) => {
        const editedDisruption = await tx.disruptionsEdited.findFirst({
            where: {
                id: disruptionId,
                orgId: id,
            },
            include: {
                consequences: true,
            },
        });

        if (!editedDisruption) {
            throw new Error("Edited disruption not found");
        }

        const disruptionToInsert = {
            ...editedDisruption,
            disruptionId: undefined,
            consequences: undefined,
        };

        await tx.disruptions.delete({
            where: {
                id: disruptionId,
                orgId: id,
            },
        });

        await tx.disruptions.create({
            data: {
                ...disruptionToInsert,
                consequences: {
                    createMany: {
                        data: editedDisruption.consequences.map(({ disruptionId, ...rest }) => ({ ...rest })),
                    },
                },
            },
        });

        // await tx.disruptionsEdited.delete({
        //     where: {
        //         id: disruptionId,
        //         orgId: id,
        //     },
        // });
    });
};

export const publishEditedConsequencesAndSocialMediaPostsIntoPending = async (disruptionId: string, id: string) => {
    logger.info(`Publishing edited disruption ${disruptionId} to pending status...`);

    await dbClient.disruptionsEdited.update({
        where: {
            id: disruptionId,
            orgId: id,
        },
        data: {
            publishStatus: PublishStatus.editPendingApproval,
        },
    });
};

export const deleteEditedDisruption = async (disruptionId: string, id: string) => {
    logger.info(`Deleting edited disruption (${disruptionId})...`);

    await dbClient.disruptionsEdited.delete({
        where: {
            id: disruptionId,
            orgId: id,
        },
        include: {
            consequences: true,
        },
    });
};

export const isDisruptionInEdit = async (disruptionId: string, id: string) => {
    logger.info(`Check if there are any edit records for disruption (${disruptionId})...`);

    const disruption = await dbClient.disruptionsEdited.findFirst({
        where: {
            id: disruptionId,
            orgId: id,
        },
    });

    return !!disruption;
};

export const getDisruptionInfoByPermitReferenceNumber = async (
    permitReferenceNumber: string,
    orgId: string,
): Promise<Disruption | null> => {
    logger.info(`Retrieving disruption info associated with road permit reference (${permitReferenceNumber})...`);

    const disruptionInfo = await dbClient.disruptions.findFirst({
        where: {
            orgId,
            permitReferenceNumber,
        },
    });

    if (!disruptionInfo) {
        logger.info(`No disruption found for roadwork permit reference (${permitReferenceNumber})`);
        return null;
    }

    const parsedDisruptionInfo = disruptionSchema.safeParse(disruptionInfo);

    if (!parsedDisruptionInfo.success) {
        logger.warn(`Invalid disruption found for roadwork permit reference (${permitReferenceNumber})`);
        logger.warn(inspect(parsedDisruptionInfo.error, false, null));

        return null;
    }

    return parsedDisruptionInfo.data;
};
