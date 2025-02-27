import { z } from "zod";
import {
    permitStatus,
    workCategory,
    workStatus,
    trafficManagementTypes
} from "@create-disruptions-data/shared-ts/roadwork.zod";

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
    lastUpdatedDateTime: z.string().datetime(),
    createdDateTime: z.string().datetime().optional(),
});

