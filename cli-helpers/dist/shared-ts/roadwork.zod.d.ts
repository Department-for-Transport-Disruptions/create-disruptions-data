import { z } from "zod";
declare const workStatus: z.ZodUnion<[z.ZodLiteral<"Works planned">, z.ZodLiteral<"Works in progress">, z.ZodLiteral<"Works completed">, z.ZodLiteral<"Works cancelled">, z.ZodLiteral<"Non notifiable works">, z.ZodLiteral<"Unattributable works">, z.ZodLiteral<"Historical works">, z.ZodLiteral<"Section 81 works">]>;
export type WorkStatus = z.infer<typeof workStatus>;
declare const trafficManagementTypes: z.ZodUnion<[z.ZodLiteral<"Road closure">, z.ZodLiteral<"Contra-flow">, z.ZodLiteral<"Lane closure">, z.ZodLiteral<"Multi-way signals">, z.ZodLiteral<"Two-way signals">, z.ZodLiteral<"Convoy workings">, z.ZodLiteral<"Stop/go boards">, z.ZodLiteral<"Temporary obstruction 15 minute delay">, z.ZodLiteral<"Priority working">, z.ZodLiteral<"Give and take">, z.ZodLiteral<"Some carriageway incursion">, z.ZodLiteral<"No carriageway incursion">]>;
export type TrafficManagementType = z.infer<typeof trafficManagementTypes>;
declare const permitStatus: z.ZodUnion<[z.ZodLiteral<"submitted">, z.ZodLiteral<"granted">, z.ZodLiteral<"permit_modification_request">, z.ZodLiteral<"refused">, z.ZodLiteral<"closed">, z.ZodLiteral<"cancelled">, z.ZodLiteral<"revoked">, z.ZodLiteral<"progressed">]>;
export type PermitStatus = z.infer<typeof permitStatus>;
declare const workCategory: z.ZodUnion<[z.ZodLiteral<"Minor">, z.ZodLiteral<"Standard">, z.ZodLiteral<"Major">, z.ZodLiteral<"Major(PAA)">, z.ZodLiteral<"Immediate - urgent">, z.ZodLiteral<"Immediate - emergency">, z.ZodLiteral<"HS2 (Highway)">]>;
export type WorkCategory = z.infer<typeof workCategory>;
export declare const roadwork: z.ZodObject<{
    permitReferenceNumber: z.ZodString;
    highwayAuthority: z.ZodOptional<z.ZodString>;
    highwayAuthoritySwaCode: z.ZodNumber;
    worksLocationCoordinates: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    streetName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    areaName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    proposedStartDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    proposedEndDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actualStartDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actualEndDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    workStatus: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodLiteral<"Works planned">, z.ZodLiteral<"Works in progress">, z.ZodLiteral<"Works completed">, z.ZodLiteral<"Works cancelled">, z.ZodLiteral<"Non notifiable works">, z.ZodLiteral<"Unattributable works">, z.ZodLiteral<"Historical works">, z.ZodLiteral<"Section 81 works">]>>>;
    activityType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    permitStatus: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodLiteral<"submitted">, z.ZodLiteral<"granted">, z.ZodLiteral<"permit_modification_request">, z.ZodLiteral<"refused">, z.ZodLiteral<"closed">, z.ZodLiteral<"cancelled">, z.ZodLiteral<"revoked">, z.ZodLiteral<"progressed">]>>>;
    town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    administrativeAreaCode: z.ZodString;
    workCategory: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodLiteral<"Minor">, z.ZodLiteral<"Standard">, z.ZodLiteral<"Major">, z.ZodLiteral<"Major(PAA)">, z.ZodLiteral<"Immediate - urgent">, z.ZodLiteral<"Immediate - emergency">, z.ZodLiteral<"HS2 (Highway)">]>>>;
    trafficManagementType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lastUpdatedDatetime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    permitReferenceNumber: string;
    highwayAuthoritySwaCode: number;
    administrativeAreaCode: string;
    highwayAuthority?: string | undefined;
    worksLocationCoordinates?: string | null | undefined;
    streetName?: string | null | undefined;
    areaName?: string | null | undefined;
    proposedStartDateTime?: string | null | undefined;
    proposedEndDateTime?: string | null | undefined;
    actualStartDateTime?: string | null | undefined;
    actualEndDateTime?: string | null | undefined;
    workStatus?: "Works planned" | "Works in progress" | "Works completed" | "Works cancelled" | "Non notifiable works" | "Unattributable works" | "Historical works" | "Section 81 works" | null | undefined;
    activityType?: string | null | undefined;
    permitStatus?: "closed" | "cancelled" | "submitted" | "granted" | "permit_modification_request" | "refused" | "revoked" | "progressed" | null | undefined;
    town?: string | null | undefined;
    workCategory?: "Minor" | "Standard" | "Major" | "Major(PAA)" | "Immediate - urgent" | "Immediate - emergency" | "HS2 (Highway)" | null | undefined;
    trafficManagementType?: string | null | undefined;
    createdDateTime?: string | null | undefined;
    lastUpdatedDatetime?: string | null | undefined;
}, {
    permitReferenceNumber: string;
    highwayAuthoritySwaCode: number;
    administrativeAreaCode: string;
    highwayAuthority?: string | undefined;
    worksLocationCoordinates?: string | null | undefined;
    streetName?: string | null | undefined;
    areaName?: string | null | undefined;
    proposedStartDateTime?: string | null | undefined;
    proposedEndDateTime?: string | null | undefined;
    actualStartDateTime?: string | null | undefined;
    actualEndDateTime?: string | null | undefined;
    workStatus?: "Works planned" | "Works in progress" | "Works completed" | "Works cancelled" | "Non notifiable works" | "Unattributable works" | "Historical works" | "Section 81 works" | null | undefined;
    activityType?: string | null | undefined;
    permitStatus?: "closed" | "cancelled" | "submitted" | "granted" | "permit_modification_request" | "refused" | "revoked" | "progressed" | null | undefined;
    town?: string | null | undefined;
    workCategory?: "Minor" | "Standard" | "Major" | "Major(PAA)" | "Immediate - urgent" | "Immediate - emergency" | "HS2 (Highway)" | null | undefined;
    trafficManagementType?: string | null | undefined;
    createdDateTime?: string | null | undefined;
    lastUpdatedDatetime?: string | null | undefined;
}>;
export type Roadwork = z.infer<typeof roadwork>;
export declare const roadworkWithCoordinatesSchema: z.ZodObject<{
    permitReferenceNumber: z.ZodString;
    highwayAuthority: z.ZodOptional<z.ZodString>;
    highwayAuthoritySwaCode: z.ZodNumber;
    worksLocationCoordinates: z.ZodObject<{
        type: z.ZodLiteral<"Feature">;
        geometry: z.ZodObject<{
            type: z.ZodLiteral<"Point">;
            coordinates: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "Point";
            coordinates: number[];
        }, {
            type: "Point";
            coordinates: number[];
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: number[];
        };
    }, {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: number[];
        };
    }>;
    streetName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    areaName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    proposedStartDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    proposedEndDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actualStartDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actualEndDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    workStatus: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodLiteral<"Works planned">, z.ZodLiteral<"Works in progress">, z.ZodLiteral<"Works completed">, z.ZodLiteral<"Works cancelled">, z.ZodLiteral<"Non notifiable works">, z.ZodLiteral<"Unattributable works">, z.ZodLiteral<"Historical works">, z.ZodLiteral<"Section 81 works">]>>>;
    activityType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    permitStatus: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodLiteral<"submitted">, z.ZodLiteral<"granted">, z.ZodLiteral<"permit_modification_request">, z.ZodLiteral<"refused">, z.ZodLiteral<"closed">, z.ZodLiteral<"cancelled">, z.ZodLiteral<"revoked">, z.ZodLiteral<"progressed">]>>>;
    town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    administrativeAreaCode: z.ZodString;
    workCategory: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodLiteral<"Minor">, z.ZodLiteral<"Standard">, z.ZodLiteral<"Major">, z.ZodLiteral<"Major(PAA)">, z.ZodLiteral<"Immediate - urgent">, z.ZodLiteral<"Immediate - emergency">, z.ZodLiteral<"HS2 (Highway)">]>>>;
    trafficManagementType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdDateTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lastUpdatedDatetime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    permitReferenceNumber: string;
    highwayAuthoritySwaCode: number;
    worksLocationCoordinates: {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: number[];
        };
    };
    administrativeAreaCode: string;
    highwayAuthority?: string | undefined;
    streetName?: string | null | undefined;
    areaName?: string | null | undefined;
    proposedStartDateTime?: string | null | undefined;
    proposedEndDateTime?: string | null | undefined;
    actualStartDateTime?: string | null | undefined;
    actualEndDateTime?: string | null | undefined;
    workStatus?: "Works planned" | "Works in progress" | "Works completed" | "Works cancelled" | "Non notifiable works" | "Unattributable works" | "Historical works" | "Section 81 works" | null | undefined;
    activityType?: string | null | undefined;
    permitStatus?: "closed" | "cancelled" | "submitted" | "granted" | "permit_modification_request" | "refused" | "revoked" | "progressed" | null | undefined;
    town?: string | null | undefined;
    workCategory?: "Minor" | "Standard" | "Major" | "Major(PAA)" | "Immediate - urgent" | "Immediate - emergency" | "HS2 (Highway)" | null | undefined;
    trafficManagementType?: string | null | undefined;
    createdDateTime?: string | null | undefined;
    lastUpdatedDatetime?: string | null | undefined;
}, {
    permitReferenceNumber: string;
    highwayAuthoritySwaCode: number;
    worksLocationCoordinates: {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: number[];
        };
    };
    administrativeAreaCode: string;
    highwayAuthority?: string | undefined;
    streetName?: string | null | undefined;
    areaName?: string | null | undefined;
    proposedStartDateTime?: string | null | undefined;
    proposedEndDateTime?: string | null | undefined;
    actualStartDateTime?: string | null | undefined;
    actualEndDateTime?: string | null | undefined;
    workStatus?: "Works planned" | "Works in progress" | "Works completed" | "Works cancelled" | "Non notifiable works" | "Unattributable works" | "Historical works" | "Section 81 works" | null | undefined;
    activityType?: string | null | undefined;
    permitStatus?: "closed" | "cancelled" | "submitted" | "granted" | "permit_modification_request" | "refused" | "revoked" | "progressed" | null | undefined;
    town?: string | null | undefined;
    workCategory?: "Minor" | "Standard" | "Major" | "Major(PAA)" | "Immediate - urgent" | "Immediate - emergency" | "HS2 (Highway)" | null | undefined;
    trafficManagementType?: string | null | undefined;
    createdDateTime?: string | null | undefined;
    lastUpdatedDatetime?: string | null | undefined;
}>;
export type RoadworkWithCoordinates = z.infer<typeof roadworkWithCoordinatesSchema>;
export {};
