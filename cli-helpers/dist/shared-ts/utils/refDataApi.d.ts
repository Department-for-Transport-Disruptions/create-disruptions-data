import { z } from "zod";
import { Logger } from ".";
import { Service, ServiceWithCentrePoint } from "../disruptionTypes";
import { Datasource } from "../enums";
export declare const fetchService: (serviceRef: string, nocCode: string, dataSource: Datasource, logger: Logger) => Promise<ServiceWithCentrePoint | null>;
export declare const getServiceCentrePoint: (service: Service) => Promise<{
    latitude: string | null;
    longitude: string | null;
}>;
export declare const getRecentlyCancelledRoadworks: () => Promise<{
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
}[] | null>;
export declare const getRecentlyNewRoadworks: () => Promise<{
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
}[] | null>;
declare const adminAreaSchema: z.ZodObject<{
    administrativeAreaCode: z.ZodString;
    name: z.ZodString;
    shortName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    administrativeAreaCode: string;
    shortName: string;
}, {
    name: string;
    administrativeAreaCode: string;
    shortName: string;
}>;
export type AdminArea = z.infer<typeof adminAreaSchema>;
export declare const fetchAdminAreas: () => Promise<{
    name: string;
    administrativeAreaCode: string;
    shortName: string;
}[]>;
export {};
