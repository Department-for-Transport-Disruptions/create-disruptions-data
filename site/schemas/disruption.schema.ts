import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { consequenceSchema } from "./consequence.schema";
import { createDisruptionsSchemaRefined } from "./create-disruption.schema";
import { socialMediaPostSchema } from "./social-media.schema";
import { setZodDefaultError, splitCamelCaseToString } from "../utils";
import { getDateForExporter } from "../utils/dates";

const historySchema = z.object({
    historyItems: z.array(z.string()),
    user: z.string(),
    datetime: z.string().datetime(),
    status: z.nativeEnum(PublishStatus),
});

export type History = z.infer<typeof historySchema>;

export const disruptionSchema = createDisruptionsSchemaRefined.and(
    z.object({
        consequences: z.array(consequenceSchema).optional(),
        deletedConsequences: z.array(z.object({ consequenceIndex: z.number() })).optional(),
        history: z.array(historySchema).optional(),
        newHistory: z.array(z.string()).optional(),
        publishStatus: z.nativeEnum(PublishStatus).default(PublishStatus.draft),
        socialMediaPosts: z.array(socialMediaPostSchema).optional(),
    }),
);

export type Disruption = z.infer<typeof disruptionSchema>;

export const exportFileSchema = z.object({
    exportType: z.union(
        [z.literal("csv"), z.literal("excel"), z.literal("pdf")],
        setZodDefaultError("Select a format to export"),
    ),
});

export type ExportFileType = z.infer<typeof exportFileSchema>;

const displayValidityPeriod = z.object({
    startTime: z.string(),
    endTime: z.string().optional().nullish(),
});

export const exportDisruptionsSchema = z.array(
    z
        .object({
            index: z.number(),
            summary: z.string(),
            modes: z.array(z.string()),
            isOperatorWideCq: z.boolean(),
            isNetworkWideCq: z.boolean(),
            serviceIds: z.array(z.string()).optional(),
            stopsAffectedCount: z.number(),
            validityPeriods: z.array(displayValidityPeriod),
            severity: z.string(),
            isLive: z.boolean(),
            status: z.string(),
        })
        .transform((item) => {
            return {
                id: item.index,
                title: item.summary,
                mode: item.modes.map((mode) => splitCamelCaseToString(mode)).join(", ") || "N/A",
                "operator wide": item.isOperatorWideCq ? "yes" : "no",
                "network wide": item.isNetworkWideCq ? "yes" : "no",
                "services affected": item.serviceIds ? item.serviceIds.length : 0,
                "stops affected": item.stopsAffectedCount,
                start: getDateForExporter(item.validityPeriods[0].startTime),
                end: item.validityPeriods[0].endTime ? getDateForExporter(item.validityPeriods[0].endTime) : "",
                severity: splitCamelCaseToString(item.severity),
                live: item.isLive ? "yes" : "no",
                status: splitCamelCaseToString(item.status),
            };
        }),
);

export type ExportDisruptions = z.infer<typeof exportDisruptionsSchema>;

export type ExportDisruptionData = ExportDisruptions[0];
