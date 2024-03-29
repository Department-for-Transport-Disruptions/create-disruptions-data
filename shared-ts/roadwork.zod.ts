import { z } from "zod";

const workStatus = z.union([
    z.literal("Works planned"),
    z.literal("Works in progress"),
    z.literal("Works completed"),
    z.literal("Works cancelled"),
    z.literal("Non notifiable works"),
    z.literal("Unattributable works"),
    z.literal("Historical works"),
    z.literal("Section 81 works"),
]);

export type WorkStatus = z.infer<typeof workStatus>;

const trafficManagementTypes = z.union([
    z.literal("Road closure"),
    z.literal("Contra-flow"),
    z.literal("Lane closure"),
    z.literal("Multi-way signals"),
    z.literal("Two-way signals"),
    z.literal("Convoy workings"),
    z.literal("Stop/go boards"),
    z.literal("Temporary obstruction 15 minute delay"),
    z.literal("Priority working"),
    z.literal("Give and take"),
    z.literal("Some carriageway incursion"),
    z.literal("No carriageway incursion"),
]);

export type TrafficManagementType = z.infer<typeof trafficManagementTypes>;

const permitStatus = z.union([
    z.literal("submitted"),
    z.literal("granted"),
    z.literal("permit_modification_request"),
    z.literal("refused"),
    z.literal("closed"),
    z.literal("cancelled"),
    z.literal("revoked"),
    z.literal("progressed"),
]);

export type PermitStatus = z.infer<typeof permitStatus>;

const workCategory = z.union([
    z.literal("Minor"),
    z.literal("Standard"),
    z.literal("Major"),
    z.literal("Major(PAA)"),
    z.literal("Immediate - urgent"),
    z.literal("Immediate - emergency"),
    z.literal("HS2 (Highway)"),
]);

export type WorkCategory = z.infer<typeof workCategory>;

export const roadwork = z.object({
    permitReferenceNumber: z.string(),
    highwayAuthority: z.string().optional(),
    highwayAuthoritySwaCode: z.coerce.number(),
    worksLocationCoordinates: z.string().nullish(),
    streetName: z.string().nullish(),
    areaName: z.string().nullish(),
    proposedStartDateTime: z.string().datetime().nullish(),
    proposedEndDateTime: z.string().datetime().nullish(),
    actualStartDateTime: z.string().datetime().nullish(),
    actualEndDateTime: z.string().datetime().nullish(),
    workStatus: workStatus.nullish(),
    activityType: z.string().nullish(),
    permitStatus: permitStatus.nullish(),
    town: z.string().nullish(),
    administrativeAreaCode: z.string(),
    workCategory: workCategory.nullish(),
    trafficManagementType: z.string().nullish(),
    createdDateTime: z.string().datetime().nullish(),
    lastUpdatedDatetime: z.string().datetime().nullish(),
});

export type Roadwork = z.infer<typeof roadwork>;

export const roadworkWithCoordinatesSchema = z.object({
    permitReferenceNumber: z.string(),
    highwayAuthority: z.string().optional(),
    highwayAuthoritySwaCode: z.coerce.number(),
    worksLocationCoordinates: z.object({
        type: z.literal("Feature"),
        geometry: z.object({
            type: z.literal("Point"),
            coordinates: z.array(z.number()),
        }),
    }),
    streetName: z.string().nullish(),
    areaName: z.string().nullish(),
    proposedStartDateTime: z.string().datetime().nullish(),
    proposedEndDateTime: z.string().datetime().nullish(),
    actualStartDateTime: z.string().datetime().nullish(),
    actualEndDateTime: z.string().datetime().nullish(),
    workStatus: workStatus.nullish(),
    activityType: z.string().nullish(),
    permitStatus: permitStatus.nullish(),
    town: z.string().nullish(),
    administrativeAreaCode: z.string(),
    workCategory: workCategory.nullish(),
    trafficManagementType: z.string().nullish(),
    createdDateTime: z.string().datetime().nullish(),
    lastUpdatedDatetime: z.string().datetime().nullish(),
});

export type RoadworkWithCoordinates = z.infer<typeof roadworkWithCoordinatesSchema>;
