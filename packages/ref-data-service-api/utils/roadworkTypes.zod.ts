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

export const worksLocationTypes = [
    "Footway",
    "Carriageway",
    "Verge",
    "Footpath",
    "Parking place",
    "Bus stop or stand",
    "Cycle hire docking station",
    "Taxi rank",
    "Cycleway",
];

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

export const permitStatus = z.union([
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

export const roadworkSchema = z.object({
    permitReferenceNumber: z.string(),
    highwayAuthority: z.string(),
    highwayAuthoritySwaCode: z.coerce.number(),
    worksLocationCoordinates: z.string().nullable(),
    streetName: z.string().nullable(),
    areaName: z.string().nullable(),
    workCategory: workCategory.nullable(),
    trafficManagementType: trafficManagementTypes.nullable(),
    proposedStartDateTime: z.string().datetime().nullable(),
    proposedEndDateTime: z.string().datetime().nullable(),
    actualStartDateTime: z.string().datetime().nullable(),
    actualEndDateTime: z.string().datetime().nullable(),
    workStatus: workStatus.nullable(),
    usrn: z.string().nullable(),
    activityType: z.string().nullable(),
    worksLocationType: z.string().nullable(),
    isTrafficSensitive: z.union([z.literal("Yes"), z.literal("No")]).nullable(),
    permitStatus: permitStatus.nullable(),
    town: z.string().nullable(),
    currentTrafficManagementType: trafficManagementTypes.nullable(),
    currentTrafficManagementTypeUpdateDate: z.string().datetime().nullable(),
    lastUpdatedDatetime: z.string().datetime(),
    createdDateTime: z.string().datetime().optional(),
});

export type Roadwork = z.infer<typeof roadworkSchema>;
