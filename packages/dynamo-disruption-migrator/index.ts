import { randomUUID } from "crypto";
import { inspect } from "util";
import { NewConsequenceDB, NewDisruptionDB } from "@create-disruptions-data/shared-ts/db/types";
import { Consequence, Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { History } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { getDbClient, json } from "@create-disruptions-data/shared-ts/utils/db";
import { recursiveQuery, recursiveScan } from "@create-disruptions-data/shared-ts/utils/dynamo";
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
import { DynamoDBStreamHandler } from "aws-lambda";
import { sql } from "kysely";
import * as logger from "lambda-log";

const dbClient = getDbClient();

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
const disruptionIdsWithNoInfo = new Set();
const editedDisruptionIdsWithNoInfo = new Set();

const collectDisruptionsData = (
    disruptionItems: Record<string, unknown>[],
    disruptionId: string,
    onlyIncludeEdited: boolean,
    isTemplate?: boolean,
): FullDisruption | null => {
    const currentDisruptionItems = disruptionItems.filter((item) => (item.SK as string).startsWith(disruptionId));
    let info = currentDisruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);

    const isEdited = currentDisruptionItems.some((item) => (item.SK as string).includes("#EDIT"));

    if (!info) {
        if (onlyIncludeEdited && isEdited) {
            editedDisruptionIdsWithNoInfo.add(disruptionId);
        } else {
            disruptionIdsWithNoInfo.add(disruptionId);
        }

        return null;
    }

    if (onlyIncludeEdited && !isEdited) {
        return null;
    }

    const isPending = currentDisruptionItems.some((item) => (item.SK as string).includes("#PENDING"));

    let consequences = currentDisruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

    let socialMediaPosts = currentDisruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

    const history = currentDisruptionItems.filter(
        (item) => (item.SK as string).startsWith(`${disruptionId}#HISTORY`) ?? false,
    );

    if (isPending) {
        info = currentDisruptionItems.find((item) => item.SK === `${disruptionId}#INFO#PENDING`) ?? info;
        const pendingConsequences = currentDisruptionItems.filter(
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

        const pendingSocialMediaPosts = currentDisruptionItems.filter(
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
        info = currentDisruptionItems.find((item) => item.SK === `${disruptionId}#INFO#EDIT`) ?? info;
        const editedConsequences = currentDisruptionItems.filter(
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

        const editedSocialMediaPosts = currentDisruptionItems.filter(
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
        orgId: info.orgId || info.PK || "",
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

        if (onlyIncludeEdited) {
            invalidEditedDisruptionCount++;
        } else {
            invalidDisruptionCount++;
        }

        return null;
    }

    return parsedDisruption.data;
};

const formatDisruptions = (
    disruptionsData: Record<string, unknown>[],
    getEdits: boolean,
    isTemplate: boolean,
): FullDisruption[] => {
    const disruptionIds = (disruptionsData
        .map((item) => item.disruptionId)
        .filter((value, index, array) => array.indexOf(value) === index)
        .filter(notEmpty) ?? []) as string[];

    logger.info("Collecting disruptions data...");

    logger.info(
        `${disruptionIds.length} unique ${!getEdits ? "non-edited" : ""} ${isTemplate ? "templates" : "disruptions"}`,
    );

    return (
        disruptionIds
            ?.map((id) => collectDisruptionsData(disruptionsData || [], id, getEdits, isTemplate))
            .filter(notEmpty) ?? []
    );
};

const getDisruptionFromDynamo = async (
    tableName: string,
    orgId: string,
    disruptionId: string,
    isEdit = false,
    isTemplate = false,
): Promise<FullDisruption | null> => {
    logger.info(`Getting disruption ${disruptionId} from DynamoDB table...`);

    let disruptionItems = await recursiveQuery(
        {
            TableName: tableName,
            KeyConditionExpression: "#PK = :org_id and begins_with(#SK, :disruption_id)",
            ExpressionAttributeNames: {
                "#PK": "PK",
                "#SK": "SK",
            },
            ExpressionAttributeValues: {
                ":org_id": orgId,
                ":disruption_id": disruptionId,
            },
        },
        logger,
    );

    logger.info("Collecting disruptions data...");

    if (!isEdit) {
        disruptionItems = disruptionItems.filter((d) => !(d.SK as string).includes("#EDIT"));
    }

    return collectDisruptionsData(disruptionItems || [], disruptionId, isEdit, isTemplate);
};

const mapDynamoDisruptionToDb = (
    {
        consequences,
        deletedConsequences,
        newHistory,
        ...disruption
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    }: FullDisruption & { consequences?: any; editedDisruption?: any; editExistsInDb?: any },
    isTemplate = false,
): NewDisruptionDB => ({
    summary: disruption.summary,
    associatedLink: disruption.associatedLink,
    createdByOperatorOrgId: disruption.createdByOperatorOrgId,
    creationTime: disruption.creationTime,
    description: disruption.description,
    displayId: disruption.displayId,
    id: disruption.id,
    disruptionNoEndDateTime: disruption.disruptionNoEndDateTime,
    disruptionReason: disruption.disruptionReason,
    disruptionRepeats: disruption.disruptionRepeats,
    disruptionRepeatsEndDate: disruption.disruptionRepeatsEndDate,
    disruptionStartDate: disruption.disruptionStartDate,
    disruptionStartTime: disruption.disruptionStartTime,
    disruptionType: disruption.disruptionType,
    lastUpdated: disruption.lastUpdated,
    permitReferenceNumber: disruption.permitReferenceNumber,
    publishStartDate: disruption.publishStartDate,
    publishStartTime: disruption.publishStartTime,
    publishStatus: disruption.publishStatus,
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
    template: isTemplate,
});

const mapDynamoConsequenceToDb = ({ ...consequence }: Consequence & {}): NewConsequenceDB => ({
    consequenceIndex: consequence.consequenceIndex,
    consequenceType: consequence.consequenceType,
    description: consequence.description,
    disruptionId: consequence.disruptionId,
    disruptionSeverity: consequence.disruptionSeverity,
    removeFromJourneyPlanners: consequence.removeFromJourneyPlanners,
    vehicleMode: consequence.vehicleMode,
    disruptionDelay: consequence.disruptionDelay,
    disruptionDirection: isServicesConsequence(consequence) ? consequence.disruptionDirection : null,
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

const batchInsertDisruptions = async (disruptions: FullDisruption[], db = dbClient, isTemplate = false) => {
    logger.info(`Inserting ${disruptions.length} ${isTemplate ? "templates" : "disruptions"}...`);

    const publishedDraftAndPendingConsequences = disruptions
        .flatMap((d) => d.consequences)
        .filter(notEmpty)
        .map(mapDynamoConsequenceToDb);

    if (disruptions.length > 0) {
        const publishedDisruptionsToInsert = batchArray(disruptions.map((d) => mapDynamoDisruptionToDb(d, isTemplate)));

        for (const batch of publishedDisruptionsToInsert) {
            await db
                .insertInto("disruptions")
                .values(batch)
                .onConflict((oc) => oc.column("id").doUpdateSet((eb) => createDisruptionConflictMapping(eb, batch[0])))
                .execute();
        }
    }

    if (publishedDraftAndPendingConsequences.length > 0) {
        const publishedConsequencesToInsert = batchArray(publishedDraftAndPendingConsequences);

        for (const batch of publishedConsequencesToInsert) {
            await db
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

const batchInsertEditedDisruptions = async (disruptions: FullDisruption[], db = dbClient, isTemplate = false) => {
    logger.info(`Inserting ${disruptions.length} edited ${isTemplate ? "templates" : "disruptions"}...`);

    const editedConsequences = disruptions
        .flatMap((d) => d.consequences)
        .filter(notEmpty)
        .map(mapDynamoConsequenceToDb);

    if (disruptions.length > 0) {
        const editedDisruptionsToInsert = batchArray(disruptions.map((d) => mapDynamoDisruptionToDb(d, isTemplate)));

        for (const batch of editedDisruptionsToInsert) {
            await db
                .insertInto("disruptionsEdited")
                .values(batch)
                .onConflict((oc) => oc.column("id").doUpdateSet((eb) => createDisruptionConflictMapping(eb, batch[0])))
                .execute();
        }
    }

    if (editedConsequences.length > 0) {
        const editedConsequencesToInsert = batchArray(editedConsequences);

        for (const batch of editedConsequencesToInsert) {
            await db
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

export const bulkMigrator = async (): Promise<void> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };
        logger.info("Starting Dynamo bulk migrator...");

        const { DISRUPTIONS_TABLE, DISRUPTION_TEMPLATES_TABLE } = process.env;

        if (!DISRUPTIONS_TABLE || !DISRUPTION_TEMPLATES_TABLE) {
            throw new Error("DISRUPTIONS_TABLE not set");
        }

        invalidDisruptionCount = 0;
        invalidEditedDisruptionCount = 0;
        disruptionIdsWithNoInfo.clear();
        editedDisruptionIdsWithNoInfo.clear();

        const [allDisruptionsData, allTemplatesData] = await Promise.all([
            recursiveScan(
                {
                    TableName: DISRUPTIONS_TABLE,
                },
                logger,
            ),
            recursiveScan(
                {
                    TableName: DISRUPTION_TEMPLATES_TABLE,
                },
                logger,
            ),
        ]);

        const allDisruptionsDataWithoutEdits = allDisruptionsData.filter(
            (d) => !(d.SK as string).includes("#EDIT") && !((d.publishStatus as string) || "").includes("EDIT"),
        );
        const allTemplatesDataWithoutEdits = allTemplatesData.filter(
            (d) => !(d.SK as string).includes("#EDIT") && !((d.publishStatus as string) || "").includes("EDIT"),
        );

        const disruptions = formatDisruptions(allDisruptionsDataWithoutEdits, false, false);
        let templates = formatDisruptions(allTemplatesDataWithoutEdits, false, true);

        const disruptionIds = (disruptions
            .map((item) => item.id)
            .filter((value, index, array) => array.indexOf(value) === index)
            .filter(notEmpty) ?? []) as string[];

        templates = templates.map((t) => {
            if (!disruptionIds.includes(t.id)) {
                return t;
            }

            const newUuid = randomUUID();

            return {
                ...t,
                id: newUuid,
                consequences: t.consequences?.map((c) => ({
                    ...c,
                    disruptionId: newUuid,
                })),
            };
        });

        await Promise.all([batchInsertDisruptions(disruptions), batchInsertDisruptions(templates, dbClient, true)]);

        const editedDisruptions = formatDisruptions(allDisruptionsData, true, false);
        const editedTemplates = formatDisruptions(allTemplatesData, true, true);

        await Promise.all([
            batchInsertEditedDisruptions(editedDisruptions),
            batchInsertEditedDisruptions(editedTemplates, dbClient, true),
        ]);

        logger.info(`${invalidDisruptionCount} invalid disruptions not migrated`);
        logger.info(`${invalidEditedDisruptionCount} invalid edited disruptions not migrated`);
        logger.info(`${disruptionIdsWithNoInfo.size} disruptions with no info`);
        logger.info(`${editedDisruptionIdsWithNoInfo.size} edited disruptions with no info`);

        logger.info("Successfully migrated dynamo disruptions to RDS...");
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};

export const incrementalMigrator: DynamoDBStreamHandler = async (event): Promise<void> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };
        logger.info("Starting Dynamo incremental migrator...");

        await Promise.all(
            event.Records.map(async (e) => {
                const keys = e.dynamodb?.Keys;
                const pk = keys?.PK;
                const sk = keys?.SK;

                const eventSourceArn = e.eventSourceARN;
                const dynamoTable = eventSourceArn?.split(":")[5].split("/")[1];

                if (!dynamoTable) {
                    return null;
                }

                const isTemplate = dynamoTable?.includes("template");

                if (!pk?.S || !sk?.S) {
                    return null;
                }

                const orgId = pk.S;
                const disruptionId = sk.S.split("#")[0];

                logger.info(`Migrating disruption ${disruptionId} to RDS`);

                const disruption = await getDisruptionFromDynamo(dynamoTable, orgId, disruptionId, false, isTemplate);
                const editedDisruption = await getDisruptionFromDynamo(
                    dynamoTable,
                    orgId,
                    disruptionId,
                    true,
                    isTemplate,
                );

                await dbClient.transaction().execute(async (trx) => {
                    await sql`SET CONSTRAINTS "disruptions_edited_id_fkey" DEFERRED`.execute(trx);

                    await trx
                        .deleteFrom("disruptions")
                        .where("orgId", "=", orgId)
                        .where("id", "=", disruptionId)
                        .execute();

                    if (!disruption) {
                        return;
                    }

                    await batchInsertDisruptions([disruption], trx, isTemplate);

                    if (!editedDisruption) {
                        return;
                    }

                    await batchInsertEditedDisruptions([editedDisruption], trx, isTemplate);
                    logger.info(`Successfully migrated disruption ${disruptionId} to RDS`);

                    return await sql`SET CONSTRAINTS "disruptions_edited_id_fkey" IMMEDIATE`.execute(trx);
                });
            }),
        );
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
