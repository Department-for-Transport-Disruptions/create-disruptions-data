import { History, disruptionSchema, historySchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, Progress } from "@create-disruptions-data/shared-ts/enums";
import {
    environmentReasonSchema,
    equipmentReasonSchema,
    miscellaneousReasonSchema,
    personnelReasonSchema,
} from "@create-disruptions-data/shared-ts/siriTypes.zod";
import { getDisruptionCreationTime } from "@create-disruptions-data/shared-ts/utils";
import { z } from "zod";
import { setZodDefaultError, splitCamelCaseToString, toTitleCase } from "../utils";
import { getDateForExporter } from "../utils/dates";
import { socialMediaPostSchema } from "./social-media.schema";

const getCreationTime = (history: History[], creationTime: string | null) => {
    const date = getDisruptionCreationTime(history, creationTime || null);
    return date ? getDateForExporter(date) : "N/A";
};

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
            .nullish(),
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

const disruptionsTableServiceSchema = z.object({
    nocCode: z.string(),
    lineName: z.string(),
    ref: z.string(),
    dataSource: z.nativeEnum(Datasource),
});

export const exportDisruptionsSchema = z.array(
    z
        .object({
            displayId: z.string(),
            summary: z.string(),
            modes: z.array(z.string()),
            isOperatorWideCq: z.boolean(),
            isNetworkWideCq: z.boolean(),
            stopsAffectedCount: z.number(),
            servicesAffectedCount: z.number(),
            validityPeriods: z.array(displayValidityPeriod),
            publishStartDate: z.string(),
            publishEndDate: z.string().optional(),
            severity: z.string(),
            isLive: z.boolean(),
            status: z.string(),
            disruptionType: z.union([z.literal("planned"), z.literal("unplanned")]),
            description: z.string().min(1).max(1000),
            disruptionReason: z.union([
                miscellaneousReasonSchema,
                environmentReasonSchema,
                personnelReasonSchema,
                equipmentReasonSchema,
            ]),
            creationTime: z.string().datetime().nullish(),
            services: z.array(disruptionsTableServiceSchema),
            history: z.array(historySchema).optional(),
        })
        .transform((item) => {
            return {
                id: item.displayId,
                title: item.summary,
                serviceModes: item.modes.map((mode) => splitCamelCaseToString(mode)).join(", ") || "N/A",
                operatorWide: item.isOperatorWideCq ? "yes" : "no",
                networkWide: item.isNetworkWideCq ? "yes" : "no",
                servicesAffectedCount: item.servicesAffectedCount,
                stopsAffectedCount: item.stopsAffectedCount,
                startDate: getDateForExporter(item.validityPeriods[0].startTime),
                endDate: item.validityPeriods[0].endTime ? getDateForExporter(item.validityPeriods[0].endTime) : "N/A",
                publishStartDate: getDateForExporter(item.publishStartDate),
                publishEndDate: item.publishEndDate ? getDateForExporter(item.publishEndDate) : "N/A",
                severity: splitCamelCaseToString(item.severity),
                isLive: item.isLive ? "yes" : "no",
                status: splitCamelCaseToString(item.status),
                description: item.description,
                disruptionType: toTitleCase(item.disruptionType),
                disruptionReason: item.disruptionReason,
                creationTime: getCreationTime(item.history || [], item.creationTime || null) ?? "N/A",
                servicesAffected:
                    item.services?.map((service) => `${service.lineName} - ${service.nocCode}`).join(", ") || "N/A",
            };
        }),
);

export type ExportDisruptions = z.infer<typeof exportDisruptionsSchema>;

export type ExportDisruptionData = ExportDisruptions[0];

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
    servicesAffectedCount: z.number(),
    consequenceLength: z.number().optional(),
    disruptionType: z.union([z.literal("planned"), z.literal("unplanned")]),
    description: z.string().min(1).max(1000),
    disruptionReason: z.union([
        miscellaneousReasonSchema,
        environmentReasonSchema,
        personnelReasonSchema,
        equipmentReasonSchema,
    ]),
    creationTime: z.string().datetime().nullish(),
    history: z.array(historySchema).optional(),
});

export type TableDisruption = z.infer<typeof disruptionsTableSchema>;
