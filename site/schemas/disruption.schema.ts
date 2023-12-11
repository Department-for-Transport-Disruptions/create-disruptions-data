import { disruptionSchema, historySchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, Progress } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { socialMediaPostSchema } from "./social-media.schema";
import { setZodDefaultError, splitCamelCaseToString } from "../utils";
import { getDateForExporter } from "../utils/dates";

export const fullDisruptionSchema = disruptionSchema.and(
    z.object({
        deletedConsequences: z.array(z.object({ consequenceIndex: z.number() })).optional(),
        history: z.array(historySchema).optional(),
        newHistory: z.array(z.string()).optional(),
        template: z.boolean().optional().default(false),
        socialMediaPosts: z
            .array(socialMediaPostSchema)
            .max(5, {
                message: "Only up to 5 social media posts can be added",
            })
            .optional(),
    }),
);

export type FullDisruption = z.infer<typeof fullDisruptionSchema>;

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
            displayId: z.string(),
            summary: z.string(),
            modes: z.array(z.string()),
            isOperatorWideCq: z.boolean(),
            isNetworkWideCq: z.boolean(),
            serviceIds: z.array(z.string()).optional(),
            stopsAffectedCount: z.number(),
            validityPeriods: z.array(displayValidityPeriod),
            publishStartDate: z.string(),
            publishEndDate: z.string().optional(),
            severity: z.string(),
            isLive: z.boolean(),
            status: z.string(),
        })
        .transform((item) => {
            return {
                id: item.displayId,
                title: item.summary,
                serviceModes: item.modes.map((mode) => splitCamelCaseToString(mode)).join(", ") || "N/A",
                operatorWide: item.isOperatorWideCq ? "yes" : "no",
                networkWide: item.isNetworkWideCq ? "yes" : "no",
                servicesAffectedCount: item.serviceIds ? item.serviceIds.length : 0,
                stopsAffectedCount: item.stopsAffectedCount,
                startDate: getDateForExporter(item.validityPeriods[0].startTime),
                endDate: item.validityPeriods[0].endTime ? getDateForExporter(item.validityPeriods[0].endTime) : "",
                publishStartDate: getDateForExporter(item.publishStartDate),
                publishEndDate: item.publishEndDate ? getDateForExporter(item.publishEndDate) : "",
                severity: splitCamelCaseToString(item.severity),
                isLive: item.isLive ? "yes" : "no",
                status: splitCamelCaseToString(item.status),
            };
        }),
);

export type ExportDisruptions = z.infer<typeof exportDisruptionsSchema>;

export type ExportDisruptionData = ExportDisruptions[0];

const disruptionsTableServiceSchema = z.object({
    ref: z.string(),
    dataSource: z.nativeEnum(Datasource),
});

export const disruptionsTableSchema = z.object({
    displayId: z.string(),
    id: z.string(),
    summary: z.string(),
    modes: z.array(z.string()),
    validityPeriods: z.array(
        z.object({
            startTime: z.string(),
            endTime: z.string().nullable(),
        }),
    ),
    publishStartDate: z.string(),
    publishEndDate: z.string().optional(),
    severity: z.string(),
    status: z.nativeEnum(Progress),
    services: z.array(disruptionsTableServiceSchema),
    dataSource: z.nativeEnum(Datasource).optional(),
    operators: z.array(z.string()),
    isOperatorWideCq: z.boolean(),
    isNetworkWideCq: z.boolean(),
    isLive: z.boolean(),
    stopsAffectedCount: z.number(),
    consequenceLength: z.number().optional(),
});

export type TableDisruption = z.infer<typeof disruptionsTableSchema>;
