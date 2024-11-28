import { randomUUID } from "crypto";
import { inspect } from "util";
import { NewConsequenceDB, NewDisruptionDB } from "@create-disruptions-data/shared-ts/db/types";
import { Consequence, Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { History } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { getDbClient, json } from "@create-disruptions-data/shared-ts/utils/db";
import { recursiveScan } from "@create-disruptions-data/shared-ts/utils/dynamo";
import {
    createConsequenceConflictMapping,
    createDisruptionConflictMapping,
} from "@create-disruptions-data/site/data/db";
import { FullDisruption, fullDisruptionSchema } from "@create-disruptions-data/site/schemas/disruption.schema";
import {
    isJourneysConsequence,
    isNetworkConsequence,
    isOperatorConsequence,
    isServicesConsequence,
    isStopsConsequence,
} from "@create-disruptions-data/site/utils";
import { getValidityAndPublishStartAndEndDates } from "@create-disruptions-data/site/utils/dates";
import * as logger from "lambda-log";

export const getDisruptionCreationTime = (disruptionHistory: History[] | null, creationTime: string | null): string => {
    if (creationTime) {
        return creationTime;
    }

    const currentTime = getDate().toISOString();

    if (disruptionHistory && disruptionHistory.length > 0) {
        return (
            disruptionHistory.find(
                (h) =>
                    !!h.historyItems.find(
                        (item) =>
                            item === "Disruption created and published" || item === "Disruption submitted for review",
                    ),
            )?.datetime ?? currentTime
        );
    }

    return currentTime;
};

let invalidDisruptionCount = 0;
let invalidEditedDisruptionCount = 0;

const collectDisruptionsData = (
    disruptionItems: Record<string, unknown>[],
    disruptionId: string,
    edited: boolean,
    isTemplate?: boolean,
): FullDisruption | null => {
    let info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);

    if (!info || !info.orgId) {
        return null;
    }

    let consequences = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

    let socialMediaPosts = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

    const isEdited = disruptionItems.some((item) => (item.SK as string).includes("#EDIT"));
    const isPending = disruptionItems.some((item) => (item.SK as string).includes("#PENDING"));

    const history = disruptionItems.filter(
        (item) => (item.SK as string).startsWith(`${disruptionId}#HISTORY`) ?? false,
    );

    if (isPending) {
        info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO#PENDING`) ?? info;
        const pendingConsequences = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).includes("#PENDING")) ??
                false,
        );
        pendingConsequences.forEach((pendingConsequence) => {
            const existingIndex = consequences.findIndex(
                (c) => c.consequenceIndex === pendingConsequence.consequenceIndex,
            );
            if (existingIndex > -1) {
                consequences[existingIndex] = pendingConsequence;
            } else {
                consequences.push(pendingConsequence);
            }
        });

        const pendingSocialMediaPosts = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                    (item.SK as string).endsWith("#PENDING")) ??
                false,
        );
        pendingSocialMediaPosts.forEach((pendingSocialMediaPost) => {
            const existingIndex = socialMediaPosts.findIndex(
                (s) => s.socialMediaPostIndex === pendingSocialMediaPost.socialMediaPostIndex,
            );
            if (existingIndex > -1) {
                socialMediaPosts[existingIndex] = pendingSocialMediaPost;
            } else {
                socialMediaPosts.push(pendingSocialMediaPost);
            }
        });
    }

    if (isEdited) {
        info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO#EDIT`) ?? info;
        const editedConsequences = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).endsWith("#EDIT")) ??
                false,
        );
        editedConsequences.forEach((editedConsequence) => {
            const existingIndex = consequences.findIndex(
                (c) => c.consequenceIndex === editedConsequence.consequenceIndex,
            );
            if (existingIndex > -1) {
                consequences[existingIndex] = editedConsequence;
            } else {
                consequences.push(editedConsequence);
            }
        });

        const editedSocialMediaPosts = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                    (item.SK as string).endsWith("#EDIT")) ??
                false,
        );
        editedSocialMediaPosts.forEach((editedSocialMediaPost) => {
            const existingIndex = socialMediaPosts.findIndex(
                (s) => s.socialMediaPostIndex === editedSocialMediaPost.socialMediaPostIndex,
            );
            if (existingIndex > -1) {
                socialMediaPosts[existingIndex] = editedSocialMediaPost;
            } else {
                socialMediaPosts.push(editedSocialMediaPost);
            }
        });
    }

    consequences = consequences.filter((consequence) => !consequence.isDeleted);

    socialMediaPosts = socialMediaPosts.filter((socialMediaPost) => !socialMediaPost.isDeleted);

    const validityPeriods = getValidityAndPublishStartAndEndDates(info as Disruption);

    const parsedDisruption = fullDisruptionSchema.safeParse({
        ...info,
        id: info.disruptionId,
        consequences,
        socialMediaPosts,
        history: isTemplate ? [] : history,
        validityStartTimestamp: validityPeriods.validityStartTimestamp.toISOString(),
        validityEndTimestamp: validityPeriods.validityEndTimestamp?.toISOString(),
        publishStartTimestamp: validityPeriods.publishStartTimestamp.toISOString(),
        publishEndTimestamp: validityPeriods.publishEndTimestamp?.toISOString(),
        creationTime: getDisruptionCreationTime(history as History[], (info.creationTime as string) ?? null),
        publishStatus:
            (info.SK as string).includes("#EDIT") && info.publishStatus === PublishStatus.published
                ? PublishStatus.editing
                : info.publishStatus,
    });

    if (!parsedDisruption.success) {
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        logger.warn(inspect(parsedDisruption.error, false, null));

        if (edited) {
            invalidEditedDisruptionCount++;
        } else {
            invalidDisruptionCount++;
        }

        return null;
    }

    return parsedDisruption.data;
};

const getAllDisruptionsDataFromDynamo = async (tableName: string, getEdits = false): Promise<FullDisruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const disruptions = await recursiveScan(
        {
            TableName: tableName,
            FilterExpression: getEdits ? "contains(#SK, :edit)" : "not contains(#SK, :edit)",
            ExpressionAttributeNames: {
                "#SK": "SK",
            },
            ExpressionAttributeValues: {
                ":edit": "#EDIT",
            },
        },
        logger,
    );

    const disruptionIds = (disruptions
        .map((item) => item.disruptionId)
        .filter((value, index, array) => array.indexOf(value) === index)
        .filter(notEmpty) ?? []) as string[];

    logger.info("Collecting disruptions data...");

    return disruptionIds?.map((id) => collectDisruptionsData(disruptions || [], id, getEdits)).filter(notEmpty) ?? [];
};

const mapDynamoDisruptionToDb = ({
    consequences,
    deletedConsequences,
    newHistory,
    ...disruption
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
}: FullDisruption & { consequences?: any; editedDisruption?: any; editExistsInDb?: any }): NewDisruptionDB => ({
    ...disruption,
    orgId: disruption.orgId ?? "",
    disruptionEndDate: disruption.disruptionEndDate ?? "",
    disruptionEndTime: disruption.disruptionEndTime ?? "",
    publishEndDate: disruption.publishEndDate ?? "",
    publishEndTime: disruption.publishEndTime ?? "",
    validityStartTimestamp: getDate(disruption.validityStartTimestamp).toDate(),
    validityEndTimestamp: disruption.validityEndTimestamp ? getDate(disruption.validityEndTimestamp).toDate() : null,
    publishStartTimestamp: getDate(disruption.publishStartTimestamp).toDate(),
    publishEndTimestamp: disruption.publishEndTimestamp ? getDate(disruption.publishEndTimestamp).toDate() : null,
    history: json(disruption.history),
    validity: disruption.validity && json(disruption.validity),
    socialMediaPosts: disruption.socialMediaPosts && json(disruption.socialMediaPosts),
    version: 1,
});

const mapDynamoConsequenceToDb = ({ ...consequence }: Consequence & {}): NewConsequenceDB => ({
    ...consequence,
    services:
        isServicesConsequence(consequence) || isJourneysConsequence(consequence)
            ? json(consequence.services)
            : json([]),
    stops: isServicesConsequence(consequence) || isStopsConsequence(consequence) ? json(consequence.stops) : json([]),
    consequenceOperators: isOperatorConsequence(consequence) ? json(consequence.consequenceOperators) : json([]),
    journeys: isJourneysConsequence(consequence) ? json(consequence.journeys) : json([]),
    disruptionArea: isNetworkConsequence(consequence) ? json(consequence.disruptionArea) : json([]),
});

const batchArray = <T>(data: T[]): T[][] => {
    const batches = [];

    while (data.length > 0) {
        const chunk = data.splice(0, 1000);
        batches.push(chunk);
    }

    return batches;
};

const batchInsertDisruptions = async (disruptions: FullDisruption[]) => {
    logger.info("Inserting disruptions into RDS...");

    const dbClient = getDbClient();

    const publishedDraftAndPendingDisruptions = disruptions
        .filter(
            (d) =>
                d.publishStatus === PublishStatus.published ||
                d.publishStatus === PublishStatus.draft ||
                d.publishStatus === PublishStatus.rejected ||
                d.publishStatus === PublishStatus.pendingApproval,
        )
        .filter(notEmpty);

    const publishedDraftAndPendingConsequences = publishedDraftAndPendingDisruptions
        .flatMap((d) => d.consequences)
        .filter(notEmpty)
        .map(mapDynamoConsequenceToDb);

    if (publishedDraftAndPendingDisruptions.length > 0) {
        const publishedDisruptionsToInsert = batchArray(
            publishedDraftAndPendingDisruptions.map(mapDynamoDisruptionToDb),
        );

        for (const batch of publishedDisruptionsToInsert) {
            await dbClient
                .insertInto("disruptions")
                .values(batch)
                .onConflict((oc) => oc.column("id").doUpdateSet((eb) => createDisruptionConflictMapping(eb, batch[0])))
                .execute();
        }
    }

    if (publishedDraftAndPendingConsequences.length > 0) {
        const publishedConsequencesToInsert = batchArray(publishedDraftAndPendingConsequences);

        for (const batch of publishedConsequencesToInsert) {
            await dbClient
                .insertInto("consequences")
                .values(batch)
                .onConflict((oc) =>
                    oc
                        .columns(["disruptionId", "consequenceIndex"])
                        .doUpdateSet((eb) => createConsequenceConflictMapping(eb, batch[0])),
                )
                .execute();
        }
    }
};

const batchInsertEditedDisruptions = async (disruptions: FullDisruption[]) => {
    const dbClient = getDbClient();

    const editedDisruptions = disruptions
        .filter(
            (d) =>
                d.publishStatus === PublishStatus.editPendingApproval ||
                d.publishStatus === PublishStatus.editing ||
                d.publishStatus === PublishStatus.pendingAndEditing,
        )
        .filter(notEmpty);

    const editedConsequences = editedDisruptions
        .flatMap((d) => d.consequences)
        .filter(notEmpty)
        .map(mapDynamoConsequenceToDb);

    if (editedDisruptions.length > 0) {
        const editedDisruptionsToInsert = batchArray(editedDisruptions.map(mapDynamoDisruptionToDb));

        for (const batch of editedDisruptionsToInsert) {
            await dbClient
                .insertInto("disruptionsEdited")
                .values(batch)
                .onConflict((oc) => oc.column("id").doUpdateSet((eb) => createDisruptionConflictMapping(eb, batch[0])))
                .execute();
        }
    }

    if (editedConsequences.length > 0) {
        const editedConsequencesToInsert = batchArray(editedConsequences);

        for (const batch of editedConsequencesToInsert) {
            await dbClient
                .insertInto("consequencesEdited")
                .values(batch)
                .onConflict((oc) =>
                    oc
                        .columns(["disruptionId", "consequenceIndex"])
                        .doUpdateSet((eb) => createConsequenceConflictMapping(eb, batch[0])),
                )
                .execute();
        }
    }
};

export const main = async (): Promise<void> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };
        logger.info("Starting Dynamo migrator...");

        invalidDisruptionCount = 0;
        invalidEditedDisruptionCount = 0;

        const disruptions = await getAllDisruptionsDataFromDynamo("disruptions-prod-copy", false);

        await batchInsertDisruptions(disruptions);

        const editedDisruptions = await getAllDisruptionsDataFromDynamo("disruptions-prod-copy", true);

        await batchInsertEditedDisruptions(editedDisruptions);

        logger.info(`${invalidDisruptionCount} invalid disruptions not migrated`);
        logger.info(`${invalidEditedDisruptionCount} invalid edited disruptions not migrated`);

        logger.info("Successfully migrated dynamo disruptions to RDS...");
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
