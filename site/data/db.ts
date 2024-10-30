import { inspect } from "util";
import {
    Consequence,
    ConsequenceOperators,
    Disruption,
    DisruptionInfo,
    Journey,
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
    isJourneysConsequence,
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
        type PrismaValidity = Validity;
        type PrismaHistory = History;
        type PrismaService = Service;
        type PrismaStop = Stop;
        type PrismaSocalMedia = SocialMediaPost;
        type PrismaOperators = ConsequenceOperators;
        type PrismaJourney = Journey;
    }
}

const removeDisruptionIdFromConsequences = (consequences?: Consequence[]): Omit<Consequence, "disruptionId">[] => {
    const copiedConsequences = structuredClone(consequences);

    return copiedConsequences?.map(({ disruptionId, ...rest }) => ({ ...rest })) ?? [];
};

export const getPublishedDisruptionsData = async (orgId: string): Promise<FullDisruption[]> => {
    logger.info("Getting disruptions data from database...");

    const disruptions = await dbClient.disruption.findMany({
        where: {
            orgId,
            publishStatus: PublishStatus.published,
        },
        include: {
            consequences: true,
        },
    });

    return makeFilteredArraySchema(fullDisruptionSchema).parse(disruptions);
};

export const getDisruptionsData = async (
    orgId: string,
    isTemplate = false,
    pageSize?: number,
    offset?: number,
): Promise<FullDisruption[]> => {
    logger.info(`Getting disruptions data from database for org ${orgId}...`);

    const disruptions = await dbClient.disruption.findMany({
        where: {
            orgId: orgId,
            template: isTemplate,
        },
        include: {
            consequences: true,
        },
        take: pageSize ?? 10,
        skip: offset ?? 0,
    });

    const editedDisruptions = await dbClient.disruptionEdited.findMany({
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
    logger.info("Getting published social media data...");

    const disruptions = await getPublishedDisruptionsData(orgId);

    const currentAndUpcomingDisruptions = disruptions.filter((disruption) =>
        isCurrentOrUpcomingDisruption(disruption.publishEndDate, disruption.publishEndTime),
    );

    return currentAndUpcomingDisruptions.flatMap((item) => item.socialMediaPosts).filter(notEmpty);
};

export const deletePublishedDisruption = async (disruptionId: string, orgId: string) => {
    logger.info(`Deleting published disruption (${disruptionId}) in org (${orgId})...`);

    // Using deleteMany here as a workaround to prisma not having a deleteIfExists function
    await Promise.all([
        dbClient.disruption.deleteMany({
            where: {
                id: disruptionId,
                orgId,
            },
        }),
        dbClient.disruptionEdited.deleteMany({
            where: {
                id: disruptionId,
                orgId,
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

        await dbClient.disruptionEdited.upsert({
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
                        disruption_id_consequence_index: {
                            disruptionId,
                            consequenceIndex: index,
                        },
                    },
                },
            },
        });
    } else {
        await dbClient.consequence.delete({
            where: {
                disruption_id_consequence_index: {
                    disruptionId,
                    consequenceIndex: index,
                },
            },
        });
    }
};

export const getDisruptionById = async (disruptionId: string, orgId: string): Promise<FullDisruption | null> => {
    logger.info(`Retrieving (${disruptionId})...`);

    let disruption = await dbClient.disruptionEdited.findFirst({
        where: {
            id: disruptionId,
            orgId,
        },
        include: {
            consequences: true,
        },
    });

    if (!disruption) {
        disruption = await dbClient.disruption.findFirst({
            where: {
                id: disruptionId,
                orgId,
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
        logger.warn(`Invalid disruption ${disruptionId}`);
        return null;
    }

    return parsedDisruption.data;
};

export const publishDisruption = async (
    disruption: FullDisruption,
    orgId: string,
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

    await dbClient.disruption.update({
        where: {
            id: disruption.id,
            orgId,
        },
        data: {
            publishStatus: status,
            history: fullHistory,
        },
    });
};

export const upsertDisruptionInfo = async (
    disruptionInfo: DisruptionInfo,
    orgId: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
    operatorOrgId?: string | null,
) => {
    logger.info(`Upserting disruption (${disruptionInfo.id})...`);

    const currentDisruption = await getDisruptionById(disruptionInfo.id, orgId);
    const isPending =
        isUserStaff &&
        !isTemplate &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    if (isEditing) {
        const consequences = currentDisruption.consequences?.map(({ disruptionId, ...rest }) => ({ ...rest }));

        await dbClient.disruptionEdited.upsert({
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
                orgId,
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
        await dbClient.disruption.upsert({
            where: {
                id: disruptionInfo.id,
                orgId,
            },
            create: {
                id: disruptionInfo.id,
                orgId,
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
                permitReferenceNumber: disruptionInfo.permitReferenceNumber,
                template: isTemplate ?? false,
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
                permitReferenceNumber: disruptionInfo.permitReferenceNumber,
                template: isTemplate ?? false,
            },
        });
    }
};

export const upsertConsequence = async (
    consequence: Consequence,
    orgId: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
): Promise<FullDisruption | null> => {
    logger.info(
        `Updating consequence index ${consequence.consequenceIndex || ""} in disruption (${
            consequence.disruptionId || ""
        })...`,
    );
    const currentDisruption = await getDisruptionById(consequence.disruptionId, orgId);

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

    const newConsequence = {
        consequenceIndex: consequence.consequenceIndex,
        consequenceType: consequence.consequenceType,
        description: consequence.description,
        disruptionSeverity: consequence.disruptionSeverity,
        removeFromJourneyPlanners: consequence.removeFromJourneyPlanners,
        vehicleMode: consequence.vehicleMode,
        disruptionDelay: consequence.disruptionDelay,
        disruptionDirection: isServicesConsequence(consequence) ? consequence.disruptionDirection : null,
        services: isServicesConsequence(consequence) || isJourneysConsequence(consequence) ? consequence.services : [],
        stops: isServicesConsequence(consequence) || isStopsConsequence(consequence) ? consequence.stops : [],
        journeys: isJourneysConsequence(consequence) ? consequence.journeys : [],
        consequenceOperators: isOperatorConsequence(consequence) ? consequence.consequenceOperators : undefined,
        disruptionArea: isNetworkConsequence(consequence) ? consequence.disruptionArea : undefined,
    };

    if (isEditing) {
        const consequencesToInsert = removeDisruptionIdFromConsequences(currentDisruption.consequences);

        const existingIndex = consequencesToInsert?.findIndex(
            (c) => c.consequenceIndex === newConsequence.consequenceIndex,
        );

        if (existingIndex > -1) {
            consequencesToInsert[existingIndex] = newConsequence;
        } else {
            consequencesToInsert.push(newConsequence);
        }

        await dbClient.disruptionEdited.upsert({
            where: {
                id: consequence.disruptionId,
                orgId,
            },
            create: {
                ...currentDisruption,
                orgId,
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
                            disruption_id_consequence_index: {
                                disruptionId: consequence.disruptionId,
                                consequenceIndex: consequence.consequenceIndex,
                            },
                        },
                        create: {
                            ...newConsequence,
                        },
                        update: {
                            ...newConsequence,
                        },
                    },
                },
            },
        });
    } else {
        await dbClient.disruption.update({
            where: {
                id: consequence.disruptionId,
                orgId,
            },
            data: {
                consequences: {
                    upsert: {
                        where: {
                            disruption_id_consequence_index: {
                                disruptionId: consequence.disruptionId,
                                consequenceIndex: consequence.consequenceIndex,
                            },
                        },
                        create: newConsequence,
                        update: newConsequence,
                    },
                },
            },
        });
    }

    return currentDisruption;
};

export const upsertSocialMediaPost = async (
    socialMediaPost: SocialMediaPostTransformed,
    orgId: string,
    isUserStaff?: boolean,
    isPublishing = false,
) => {
    logger.info(`Updating socialMediaPost index ${socialMediaPost.socialMediaPostIndex} in disruption (${orgId})...`);

    const currentDisruption = await getDisruptionById(socialMediaPost.disruptionId, orgId);
    const consequencesToInsert = removeDisruptionIdFromConsequences(currentDisruption?.consequences);
    const currentSocialMediaPosts = currentDisruption?.socialMediaPosts ?? [];
    const existingSocialMediaPostIndex = currentSocialMediaPosts?.findIndex(
        (post) => post.socialMediaPostIndex === socialMediaPost.socialMediaPostIndex,
    );
    const newSocialMediaPosts = [...(currentSocialMediaPosts ?? [])];

    if (existingSocialMediaPostIndex > -1 && newSocialMediaPosts[existingSocialMediaPostIndex]) {
        newSocialMediaPosts[existingSocialMediaPostIndex] = socialMediaPost;
    } else {
        newSocialMediaPosts.push(socialMediaPost);
    }

    const isPending =
        isUserStaff &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing =
        !isPublishing && currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    if (isEditing) {
        await dbClient.disruptionEdited.upsert({
            where: {
                id: socialMediaPost.disruptionId,
                orgId,
            },
            create: {
                ...currentDisruption,
                orgId,
                creationTime: currentDisruption.creationTime,
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                consequences: {
                    createMany: {
                        data: consequencesToInsert,
                    },
                },
                socialMediaPosts: newSocialMediaPosts,
            },
            update: {
                socialMediaPosts: newSocialMediaPosts,
            },
        });
    } else {
        await dbClient.disruption.update({
            where: {
                id: socialMediaPost.disruptionId,
                orgId,
            },
            data: {
                socialMediaPosts: newSocialMediaPosts,
            },
        });
    }
};

export const removeSocialMediaPostFromDisruption = async (index: number, disruptionId: string, orgId: string) => {
    logger.info(`Removing socialMediaPost ${index} in disruption (${disruptionId})...`);

    const currentDisruption = await getDisruptionById(disruptionId, orgId);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    const currentSocialMediaPosts = currentDisruption?.socialMediaPosts;
    const newSocialMediaPosts = currentSocialMediaPosts?.filter((post) => post.socialMediaPostIndex !== index);

    if (isEditing) {
        dbClient.disruptionEdited.update({
            where: {
                id: disruptionId,
                orgId,
            },
            data: {
                socialMediaPosts: newSocialMediaPosts,
            },
        });
    } else {
        dbClient.disruption.update({
            where: {
                id: disruptionId,
                orgId,
            },
            data: {
                socialMediaPosts: newSocialMediaPosts,
            },
        });
    }
};

export const publishEditedDisruption = async (disruptionId: string, orgId: string) => {
    logger.info(`Publishing edited disruption ${disruptionId}...`);

    await dbClient.$transaction(async (tx) => {
        const editedDisruption = await tx.disruptionEdited.findFirst({
            where: {
                id: disruptionId,
                orgId,
            },
            include: {
                consequences: true,
            },
        });

        if (!editedDisruption) {
            throw new Error("Edited disruption not found");
        }

        const parsedDisruption = fullDisruptionSchema.parse(editedDisruption);

        const consequencesToInsert = removeDisruptionIdFromConsequences(parsedDisruption.consequences);

        await tx.disruption.delete({
            where: {
                id: disruptionId,
                orgId,
            },
            include: {
                consequences: true,
            },
        });

        await tx.disruption.create({
            data: {
                ...parsedDisruption,
                orgId,
                publishStatus: PublishStatus.published,
                consequences: {
                    createMany: {
                        data: consequencesToInsert,
                    },
                },
            },
        });
    });
};

export const publishEditedDisruptionIntoPending = async (disruptionId: string, orgId: string) => {
    logger.info(`Publishing edited disruption ${disruptionId} to pending status...`);

    await dbClient.disruptionEdited.update({
        where: {
            id: disruptionId,
            orgId,
        },
        data: {
            publishStatus: PublishStatus.editPendingApproval,
        },
    });
};

export const deleteEditedDisruption = async (disruptionId: string, orgId: string) => {
    logger.info(`Deleting edited disruption (${disruptionId})...`);

    await dbClient.disruptionEdited.delete({
        where: {
            id: disruptionId,
            orgId,
        },
        include: {
            consequences: true,
        },
    });
};

export const isDisruptionInEdit = async (disruptionId: string, orgId: string) => {
    logger.info(`Check if there are any edit records for disruption (${disruptionId})...`);

    const disruption = await dbClient.disruptionEdited.findFirst({
        where: {
            id: disruptionId,
            orgId,
        },
    });

    return !!disruption;
};

export const getDisruptionInfoByPermitReferenceNumber = async (
    permitReferenceNumber: string,
    orgId: string,
): Promise<Disruption | null> => {
    logger.info(`Retrieving disruption info associated with road permit reference (${permitReferenceNumber})...`);

    const disruptionInfo = await dbClient.disruption.findFirst({
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
