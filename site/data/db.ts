import { inspect } from "util";
import {
    ConsequenceDB,
    Database,
    DisruptionDB,
    NewConsequenceDB,
    NewDisruptionDB,
} from "@create-disruptions-data/shared-ts/db/types";
import { Consequence, Disruption, DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { History, MAX_CONSEQUENCES, disruptionSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { getDate, isCurrentOrUpcomingDisruption } from "@create-disruptions-data/shared-ts/utils/dates";
import {
    getDbClient,
    json,
    withConsequences,
    withEditedConsequences,
    withEditedDisruption,
} from "@create-disruptions-data/shared-ts/utils/db";
import { ExpressionBuilder, OnConflictDatabase, OnConflictTables } from "kysely";

import { TooManyConsequencesError } from "../errors";
import { FullDisruption, fullDisruptionSchema } from "../schemas/disruption.schema";
import { SocialMediaPost, SocialMediaPostTransformed, socialMediaPostSchema } from "../schemas/social-media.schema";
import {
    flattenZodErrors,
    isJourneysConsequence,
    isNetworkConsequence,
    isOperatorConsequence,
    isServicesConsequence,
    isStopsConsequence,
    notEmpty,
    splitCamelCaseToString,
} from "../utils";
import { getValidityAndPublishStartAndEndDates } from "../utils/dates";
import logger from "../utils/logger";

const mapDisruptionToDb = ({
    consequences,
    editedDisruption,
    editExistsInDb,
    ...disruption
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
}: DisruptionDB & { consequences?: any; editedDisruption?: any; editExistsInDb?: any }): NewDisruptionDB => ({
    ...disruption,
    history: json(disruption.history),
    validity: disruption.validity && json(disruption.validity),
    socialMediaPosts: disruption.socialMediaPosts && json(disruption.socialMediaPosts),
});

const mapConsequenceToDb = (consequence: ConsequenceDB) => ({
    ...consequence,
    services: consequence.services && json(consequence.services),
    stops: consequence.stops && json(consequence.stops),
    consequenceOperators: consequence.consequenceOperators && json(consequence.consequenceOperators),
    journeys: consequence.journeys && json(consequence.journeys),
    disruptionArea: consequence.disruptionArea && json(consequence.disruptionArea),
});

const createDisruptionConflictMapping = (
    eb: ExpressionBuilder<
        OnConflictDatabase<Database, "disruptions" | "disruptionsEdited">,
        OnConflictTables<"disruptions" | "disruptionsEdited">
    >,
    disruption: NewDisruptionDB,
) => {
    const keys = Object.keys(disruption) as (keyof NewDisruptionDB)[];
    return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
};

const createConsequenceConflictMapping = (
    eb: ExpressionBuilder<
        OnConflictDatabase<Database, "consequences" | "consequencesEdited">,
        OnConflictTables<"consequences" | "consequencesEdited">
    >,
    consequence: NewConsequenceDB,
) => {
    const keys = Object.keys(consequence) as (keyof NewConsequenceDB)[];
    return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
};

export const getDisruptionsData = async (orgId: string, isTemplate = false): Promise<FullDisruption[]> => {
    logger.info(`Getting disruptions data from database for org ${orgId}...`);

    const dbClient = getDbClient(true);

    const disruptions = await dbClient
        .selectFrom("disruptions")
        .selectAll()
        .select((eb) => [withConsequences(eb)])
        .where("disruptions.orgId", "=", orgId)
        .where("disruptions.template", "=", isTemplate)
        .orderBy(["disruptions.validityStartTimestamp asc", "disruptions.validityEndTimestamp asc"])
        .execute();

    return fullDisruptionSchema.array().parse(disruptions);
};

export const getPublishedSocialMediaPosts = async (orgId: string): Promise<SocialMediaPost[]> => {
    logger.info("Getting published social media data...");

    const dbClient = getDbClient(true);

    const disruptions = await dbClient
        .selectFrom("disruptions")
        .select(["socialMediaPosts", "publishEndDate", "publishEndTime"])
        .where("disruptions.orgId", "=", orgId)
        .where("disruptions.publishStatus", "=", PublishStatus.published)
        .execute();

    const currentAndUpcomingDisruptions = disruptions.filter((disruption) =>
        isCurrentOrUpcomingDisruption(disruption.publishEndDate, disruption.publishEndTime),
    );

    return socialMediaPostSchema
        .array()
        .parse(currentAndUpcomingDisruptions.flatMap((item) => item.socialMediaPosts).filter(notEmpty));
};

export const deletePublishedDisruption = async (disruptionId: string, orgId: string) => {
    logger.info(`Deleting published disruption (${disruptionId}) in org (${orgId})...`);

    const dbClient = getDbClient();

    await dbClient
        .deleteFrom("disruptions")
        .where("disruptions.id", "=", disruptionId)
        .where("disruptions.orgId", "=", orgId)
        .execute();
};

export const removeConsequenceFromDisruption = async (
    index: number,
    disruptionId: string,
    orgId: string,
    user: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
) => {
    logger.info(`Updating consequence ${index} in disruption (${disruptionId})...`);

    const dbClient = getDbClient();

    const disruption = await getDbDisruption(disruptionId, orgId);
    const currentDisruption = disruption?.editedDisruption ?? disruption;

    const isPending =
        isUserStaff &&
        !isTemplate &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);

    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    const editedConsequences = currentDisruption?.consequences?.filter((c) => c.consequenceIndex !== index);

    if (!isEditing) {
        await dbClient
            .deleteFrom("consequences")
            .where("consequences.disruptionId", "=", disruptionId)
            .where("consequences.consequenceIndex", "=", index)
            .execute();

        return;
    }

    const consequenceToBeDeleted = currentDisruption?.consequences?.find((c) => c.consequenceIndex === index);

    const newHistory: History = {
        historyItems: [
            `Disruption ${splitCamelCaseToString(consequenceToBeDeleted?.consequenceType ?? "")} Consequence: Deleted`,
        ],
        user: user,
        status: PublishStatus.editing,
        datetime: getDate().toISOString(),
    };

    await dbClient.transaction().execute(async (trx) => {
        if (disruption?.editExistsInDb) {
            await trx
                .updateTable("disruptionsEdited")
                .set({
                    publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                    history: json([...(currentDisruption.history ?? []), newHistory]),
                })
                .where("disruptionsEdited.id", "=", disruptionId)
                .where("disruptionsEdited.orgId", "=", orgId)
                .execute();

            return await trx
                .deleteFrom("consequencesEdited")
                .where("consequencesEdited.disruptionId", "=", disruptionId)
                .where("consequencesEdited.consequenceIndex", "=", index)
                .execute();
        }

        await trx
            .insertInto("disruptionsEdited")
            .values({
                ...mapDisruptionToDb(currentDisruption),
                publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                history: json([...(currentDisruption.history ?? []), newHistory]),
                orgId,
            })
            .execute();

        const newConsequences = editedConsequences?.map(mapConsequenceToDb);

        if (newConsequences?.length) {
            return await trx.insertInto("consequencesEdited").values(newConsequences).execute();
        }

        return;
    });
};

export const getDbDisruption = async (disruptionId: string, orgId: string) => {
    logger.info(`Retrieving (${disruptionId})...`);

    const dbClient = getDbClient(true);

    const disruption = await dbClient
        .selectFrom("disruptions")
        .selectAll()
        .select((eb) => [withConsequences(eb), withEditedDisruption(eb)])
        .where("disruptions.id", "=", disruptionId)
        .where("disruptions.orgId", "=", orgId)
        .executeTakeFirst();

    return disruption
        ? {
              ...disruption,
              editExistsInDb: !!disruption.editedDisruption,
          }
        : null;
};

export const getDisruptionById = async (disruptionId: string, orgId: string): Promise<FullDisruption | null> => {
    const disruption = await getDbDisruption(disruptionId, orgId);

    if (!disruption) {
        return null;
    }

    const parsedDisruption = fullDisruptionSchema.safeParse(disruption.editedDisruption ?? disruption);

    if (!parsedDisruption.success) {
        logger.warn(inspect(flattenZodErrors(parsedDisruption.error)));
        logger.warn(`Invalid disruption ${disruptionId}`);
        return null;
    }

    return parsedDisruption.data;
};

const getHistoryText = (isTemplate: boolean, status: PublishStatus): string => {
    if (isTemplate) {
        return "Template created";
    }
    if (status === PublishStatus.rejected) {
        return "Disruption rejected";
    }
    if (status === PublishStatus.pendingApproval) {
        return "Disruption submitted for review";
    }
    return "Disruption created and published";
};

export const publishDisruption = async (
    disruption: FullDisruption,
    orgId: string,
    status: PublishStatus,
    user: string,
) => {
    logger.info(`Inserting published disruption (${disruption.id})...`);

    const dbClient = getDbClient();

    const fullHistory: History[] = [
        ...(disruption.history ?? []),
        {
            historyItems: [getHistoryText(disruption.template, status)],
            datetime: getDate().toISOString(),
            status,
            user,
        },
    ];

    await dbClient
        .updateTable("disruptions")
        .set({ publishStatus: status, history: json(fullHistory), version: 1 })
        .where("disruptions.id", "=", disruption.id)
        .where("disruptions.orgId", "=", orgId)
        .execute();
};

export const upsertDisruptionInfo = async (
    disruptionInfo: DisruptionInfo,
    orgId: string,
    user: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
    operatorOrgId?: string | null,
) => {
    logger.info(`Upserting disruption (${disruptionInfo.id})...`);

    const dbClient = getDbClient();

    const disruption = await getDbDisruption(disruptionInfo.id, orgId);
    const currentDisruption = disruption?.editedDisruption ?? disruption;

    const isPending =
        isUserStaff &&
        !isTemplate &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);

    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;
    const validityAndPublishStartAndEndDates = getValidityAndPublishStartAndEndDates(disruptionInfo);

    if (!isEditing) {
        const disruptionInfoToInsert: NewDisruptionDB = {
            ...disruptionInfo,
            createdByOperatorOrgId: operatorOrgId ?? null,
            publishStatus: PublishStatus.draft,
            orgId,
            validity: json(disruptionInfo.validity),
            history: json([]),
            version: currentDisruption?.version,
            template: isTemplate ?? false,
            validityStartTimestamp: validityAndPublishStartAndEndDates.validityStartTimestamp.toDate(),
            validityEndTimestamp: validityAndPublishStartAndEndDates.validityEndTimestamp?.toDate() ?? null,
            publishStartTimestamp: validityAndPublishStartAndEndDates.publishStartTimestamp.toDate(),
            publishEndTimestamp: validityAndPublishStartAndEndDates.publishEndTimestamp?.toDate() ?? null,
        };

        await dbClient
            .insertInto("disruptions")
            .values(disruptionInfoToInsert)
            .onConflict((oc) =>
                oc.column("id").doUpdateSet((eb) => createDisruptionConflictMapping(eb, disruptionInfoToInsert)),
            )
            .execute();

        return;
    }

    const history: History[] = [
        ...(currentDisruption.history ?? []),
        {
            historyItems: ["Disruption Info Edited"],
            user: user,
            status: PublishStatus.editing,
            datetime: getDate().toISOString(),
        },
    ];

    const disruptionInfoToInsert: NewDisruptionDB = {
        ...disruptionInfo,
        createdByOperatorOrgId: operatorOrgId ?? null,
        publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
        history: json(history),
        orgId,
        validity: json(disruptionInfo.validity),
        version: currentDisruption.version,
        template: currentDisruption.template,
        creationTime: currentDisruption.creationTime,
        validityStartTimestamp: validityAndPublishStartAndEndDates.validityStartTimestamp.toDate(),
        validityEndTimestamp: validityAndPublishStartAndEndDates.validityEndTimestamp?.toDate() ?? null,
        publishStartTimestamp: validityAndPublishStartAndEndDates.publishStartTimestamp.toDate(),
        publishEndTimestamp: validityAndPublishStartAndEndDates.publishEndTimestamp?.toDate() ?? null,
    };

    await dbClient.transaction().execute(async (trx) => {
        await trx
            .insertInto("disruptionsEdited")
            .values(disruptionInfoToInsert)
            .onConflict((oc) =>
                oc.column("id").doUpdateSet((eb) => createDisruptionConflictMapping(eb, disruptionInfoToInsert)),
            )
            .execute();

        if (!disruption?.editExistsInDb) {
            await trx
                .insertInto("consequencesEdited")
                .values(currentDisruption.consequences.map(mapConsequenceToDb))
                .execute();
        }

        return;
    });
};

export const upsertConsequence = async (
    consequence: Consequence,
    orgId: string,
    user: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
): Promise<number> => {
    logger.info(
        `Updating consequence index ${consequence.consequenceIndex || ""} in disruption (${
            consequence.disruptionId || ""
        })...`,
    );

    const dbClient = getDbClient();

    const disruption = await getDbDisruption(consequence.disruptionId, orgId);
    const currentDisruption = disruption?.editedDisruption ?? disruption;
    const maxConsequenceIndex = Math.max(
        currentDisruption?.consequences && currentDisruption.consequences.length > 0
            ? currentDisruption?.consequences.reduce((p, c) => (p.consequenceIndex > c.consequenceIndex ? p : c))
                  .consequenceIndex
            : 0,
        consequence.consequenceIndex,
    );

    if (!currentDisruption) {
        throw new Error("Disruption not found");
    }

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

    const newConsequence: NewConsequenceDB = {
        ...mapConsequenceToDb({
            disruptionId: consequence.disruptionId,
            consequenceIndex: consequence.consequenceIndex,
            consequenceType: consequence.consequenceType,
            description: consequence.description,
            disruptionSeverity: consequence.disruptionSeverity,
            removeFromJourneyPlanners: consequence.removeFromJourneyPlanners,
            vehicleMode: consequence.vehicleMode,
            disruptionDelay: consequence.disruptionDelay ?? null,
            disruptionDirection: isServicesConsequence(consequence) ? consequence.disruptionDirection : null,
            services:
                isServicesConsequence(consequence) || isJourneysConsequence(consequence) ? consequence.services : [],
            stops:
                (isServicesConsequence(consequence) || isStopsConsequence(consequence)) && consequence.stops
                    ? consequence.stops
                    : [],
            journeys: isJourneysConsequence(consequence) ? consequence.journeys : [],
            consequenceOperators: isOperatorConsequence(consequence) ? consequence.consequenceOperators : [],
            disruptionArea:
                isNetworkConsequence(consequence) && consequence.disruptionArea ? consequence.disruptionArea : [],
        }),
    };

    const existingIndex = currentDisruption.consequences?.findIndex(
        (c) => c.consequenceIndex === newConsequence.consequenceIndex,
    );

    if (!isEditing) {
        await dbClient
            .insertInto("consequences")
            .values(newConsequence)
            .onConflict((oc) =>
                oc
                    .columns(["disruptionId", "consequenceIndex"])
                    .doUpdateSet((eb) => createConsequenceConflictMapping(eb, newConsequence)),
            )
            .executeTakeFirstOrThrow();

        return maxConsequenceIndex;
    }

    const history = [...(currentDisruption.history ?? [])];

    const consequencesToInsert: NewConsequenceDB[] = currentDisruption.consequences.map(mapConsequenceToDb);

    if (existingIndex > -1) {
        consequencesToInsert[existingIndex] = newConsequence;
        history.push({
            historyItems: [
                `Disruption ${splitCamelCaseToString(newConsequence.consequenceType as string)} Consequence: Edited`,
            ],
            user: user,
            status: PublishStatus.editing,
            datetime: getDate().toISOString(),
        });
    } else {
        consequencesToInsert.push(newConsequence);
        history.push({
            historyItems: [
                `Disruption ${splitCamelCaseToString(newConsequence.consequenceType as string)} Consequence: Added`,
            ],
            user: user,
            status: PublishStatus.editing,
            datetime: getDate().toISOString(),
        });
    }

    if (disruption?.editExistsInDb) {
        await dbClient.transaction().execute(async (trx) => {
            await trx
                .insertInto("consequencesEdited")
                .values(newConsequence)
                .onConflict((oc) =>
                    oc
                        .columns(["disruptionId", "consequenceIndex"])
                        .doUpdateSet((eb) => createConsequenceConflictMapping(eb, newConsequence)),
                )
                .execute();

            await trx
                .updateTable("disruptionsEdited")
                .set({
                    history: json(history),
                })
                .execute();
        });

        return maxConsequenceIndex;
    }

    await dbClient.transaction().execute(async (trx) => {
        await trx
            .insertInto("disruptionsEdited")
            .values(
                mapDisruptionToDb({
                    ...currentDisruption,
                    publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                    history,
                }),
            )
            .onConflict((oc) =>
                oc
                    .column("id")
                    .doUpdateSet((eb) => createDisruptionConflictMapping(eb, mapDisruptionToDb(currentDisruption))),
            )
            .execute();

        return await trx
            .insertInto("consequencesEdited")
            .values(consequencesToInsert)
            .onConflict((oc) =>
                oc
                    .columns(["disruptionId", "consequenceIndex"])
                    .doUpdateSet((eb) => createConsequenceConflictMapping(eb, newConsequence)),
            )
            .execute();
    });

    return maxConsequenceIndex;
};

export const upsertSocialMediaPost = async (
    socialMediaPost: SocialMediaPostTransformed,
    orgId: string,
    isUserStaff?: boolean,
    isPublishing = false,
) => {
    logger.info(`Updating socialMediaPost index ${socialMediaPost.socialMediaPostIndex} in disruption (${orgId})...`);

    const dbClient = getDbClient();

    const disruption = await getDbDisruption(socialMediaPost.disruptionId, orgId);
    const currentDisruption = disruption?.editedDisruption ?? disruption;

    if (!currentDisruption) {
        throw new Error("Disruption not found");
    }

    const currentSocialMediaPosts = socialMediaPostSchema.array().parse(currentDisruption?.socialMediaPosts ?? []);
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

    if (isEditing && !disruption?.editExistsInDb) {
        await dbClient.transaction().execute(async (trx) => {
            await trx
                .insertInto("disruptionsEdited")
                .values({
                    ...mapDisruptionToDb({
                        ...currentDisruption,
                        socialMediaPosts: newSocialMediaPosts,
                        publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                    }),
                })
                .execute();

            return await trx
                .insertInto("consequencesEdited")
                .values(currentDisruption.consequences.map(mapConsequenceToDb))
                .execute();
        });
    }

    await dbClient
        .updateTable(isEditing ? "disruptionsEdited" : "disruptions")
        .set({
            socialMediaPosts: json(newSocialMediaPosts),
        })
        .where("id", "=", currentDisruption.id)
        .where("orgId", "=", orgId)
        .execute();
};

export const removeSocialMediaPostFromDisruption = async (
    index: number,
    disruptionId: string,
    orgId: string,
    isUserStaff?: boolean,
    isPublishing = false,
) => {
    logger.info(`Removing socialMediaPost ${index} in disruption (${disruptionId})...`);

    const dbClient = getDbClient();

    const disruption = await getDbDisruption(disruptionId, orgId);
    const currentDisruption = disruption?.editedDisruption ?? disruption;

    const currentSocialMediaPosts = socialMediaPostSchema.array().parse(currentDisruption?.socialMediaPosts);
    const newSocialMediaPosts = currentSocialMediaPosts?.filter((post) => post.socialMediaPostIndex !== index);

    const isPending =
        isUserStaff &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing =
        !isPublishing && currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    if (isEditing && !disruption?.editExistsInDb) {
        await dbClient.transaction().execute(async (trx) => {
            await trx
                .insertInto("disruptionsEdited")
                .values({
                    ...mapDisruptionToDb({
                        ...currentDisruption,
                        socialMediaPosts: newSocialMediaPosts,
                        publishStatus: isPending ? PublishStatus.pendingAndEditing : PublishStatus.editing,
                    }),
                })
                .execute();

            return await trx
                .insertInto("consequencesEdited")
                .values(currentDisruption.consequences.map(mapConsequenceToDb))
                .execute();
        });
    }

    await dbClient
        .updateTable(isEditing ? "disruptionsEdited" : "disruptions")
        .set({
            socialMediaPosts: json(newSocialMediaPosts),
        })
        .where("id", "=", disruptionId)
        .where("orgId", "=", orgId)
        .execute();
};

export const publishEditedDisruption = async (disruptionId: string, orgId: string, user: string) => {
    logger.info(`Publishing edited disruption ${disruptionId}...`);

    const dbClient = getDbClient();

    await dbClient.transaction().execute(async (trx) => {
        const editedDisruption = await trx
            .selectFrom("disruptionsEdited")
            .selectAll()
            .select((eb) => [withEditedConsequences(eb)])
            .where("disruptionsEdited.id", "=", disruptionId)
            .where("disruptionsEdited.orgId", "=", orgId)
            .executeTakeFirst();

        if (!editedDisruption) {
            throw new Error("Edited disruption not found");
        }

        const history: History[] = [
            ...(editedDisruption.history ?? []),
            {
                historyItems: [editedDisruption.template ? "Template edited" : "Edited disruption published"],
                user: user,
                status: PublishStatus.published,
                datetime: getDate().toISOString(),
            },
        ];

        await trx
            .deleteFrom("disruptions")
            .where("disruptions.id", "=", disruptionId)
            .where("disruptions.orgId", "=", orgId)
            .execute();

        await trx
            .insertInto("disruptions")
            .values({
                ...mapDisruptionToDb(editedDisruption),
                publishStatus: PublishStatus.published,
                lastUpdated: getDate().toISOString(),
                history: json(history),
                version: editedDisruption.version ? editedDisruption.version + 1 : 1,
            })
            .execute();

        return await trx
            .insertInto("consequences")
            .values(editedDisruption.consequences.map(mapConsequenceToDb))
            .execute();
    });
};

export const publishEditedDisruptionIntoPending = async (disruptionId: string, orgId: string, user: string) => {
    logger.info(`Publishing edited disruption ${disruptionId} to pending status...`);

    const dbClient = getDbClient();

    const currentDisruption = await getDisruptionById(disruptionId, orgId);

    const history: History[] = [
        ...(currentDisruption?.history ?? []),
        {
            historyItems: ["Edited disruption submitted for review"],
            user: user,
            status: PublishStatus.editPendingApproval,
            datetime: getDate().toISOString(),
        },
    ];

    await dbClient
        .updateTable("disruptionsEdited")
        .set({
            publishStatus: PublishStatus.editPendingApproval,
            history: json(history),
        })
        .where("disruptionsEdited.id", "=", disruptionId)
        .where("disruptionsEdited.orgId", "=", orgId)
        .execute();
};

export const deleteEditedDisruption = async (disruptionId: string, orgId: string) => {
    logger.info(`Deleting edited disruption (${disruptionId})...`);

    const dbClient = getDbClient();

    await dbClient
        .deleteFrom("disruptionsEdited")
        .where("disruptionsEdited.id", "=", disruptionId)
        .where("disruptionsEdited.orgId", "=", orgId)
        .execute();
};

export const isDisruptionInEdit = async (disruptionId: string, orgId: string) => {
    logger.info(`Check if there are any edit records for disruption (${disruptionId})...`);

    const dbClient = getDbClient(true);

    const disruption = await dbClient
        .selectFrom("disruptionsEdited")
        .select(["id"])
        .where("disruptionsEdited.id", "=", disruptionId)
        .where("disruptionsEdited.orgId", "=", orgId)
        .executeTakeFirst();

    return !!disruption;
};

export const getDisruptionInfoByPermitReferenceNumber = async (
    permitReferenceNumber: string,
    orgId: string,
): Promise<Disruption | null> => {
    logger.info(`Retrieving disruption info associated with road permit reference (${permitReferenceNumber})...`);

    const dbClient = getDbClient(true);

    const disruptionInfo = await dbClient
        .selectFrom("disruptions")
        .selectAll()
        .where("disruptions.orgId", "=", orgId)
        .where("permitReferenceNumber", "=", permitReferenceNumber)
        .executeTakeFirst();

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

export const getPendingApprovalCount = async (orgId: string): Promise<number> => {
    logger.info("Retrieving number of pending approval disruptions...");

    const dbClient = getDbClient(true);

    const pendingCount = await dbClient
        .selectFrom("disruptions")
        .select(({ fn }) => [fn.count<string>("disruptions.id").as("pending")])
        .where("disruptions.orgId", "=", orgId)
        .where("disruptions.publishStatus", "in", [PublishStatus.editPendingApproval, PublishStatus.pendingApproval])
        .executeTakeFirst();

    return pendingCount?.pending ? Number(pendingCount.pending) : 0;
};
