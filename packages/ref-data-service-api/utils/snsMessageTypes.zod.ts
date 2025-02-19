import { z } from "zod";
import { worksLocationTypes } from "./roadworkTypes.zod";

export const snsMessageAttributeSchema = z.record(
    z.object({
        Type: z.string(),
        Value: z.string(),
    }),
);

export const snsMessageSchema = z.object({
    SignatureVersion: z.string(),
    Timestamp: z.string(),
    Signature: z.string(),
    SigningCertURL: z.string(),
    MessageId: z.string(),
    Message: z.string(),
    Type: z.string(),
    TopicArn: z.string(),
    MessageAttributes: snsMessageAttributeSchema.optional(),
    Subject: z.string().optional(),
    Token: z.string().optional(),
    UnsubscribeURL: z.string().optional(),
    SubscribeURL: z.string().optional(),
});

export type SnsMessage = z.infer<typeof snsMessageSchema>;

export const baseMessageSchema = z.object({
    event_type: z.string(),
    event_time: z.string().datetime(),
    event_reference: z.number(),
    object_type: z.string(),
});

export type BaseMessage = z.infer<typeof baseMessageSchema>;

export const permitMessageSchema = baseMessageSchema
    .and(
        z.object({
            object_data: z.object({
                permit_reference_number: z.string(),
                highway_authority: z.string(),
                highway_authority_swa_code: z.coerce.number(),
                works_location_coordinates: z.string().nullish(),
                street_name: z.string().nullish(),
                area_name: z.string().nullish(),
                work_category: z.string().nullish(),
                traffic_management_type: z.string().nullish(),
                proposed_start_date: z.string().datetime().nullish(),
                proposed_end_date: z.string().datetime().nullish(),
                actual_start_date_time: z.string().datetime().nullish(),
                actual_end_date_time: z.string().datetime().nullish(),
                work_status: z.string().nullish(),
                usrn: z.string().nullish(),
                activity_type: z.string().nullish(),
                works_location_type: z.string().nullish(),
                is_traffic_sensitive: z.string().nullish(),
                permit_status: z.string().nullish(),
                town: z.string().nullish(),
                current_traffic_management_type: z.string().nullish(),
                current_traffic_manage_type_update_date: z.string().datetime().nullish(),
            }),
        }),
    )
    .refine((data) => {
        if (data.object_data.works_location_type) {
            const worksLocationArray = data.object_data.works_location_type.split(",").map((item) => item.trim());

            return worksLocationArray.every((location) => worksLocationTypes.includes(location));
        }
    })
    .transform((data) => ({
        permitReferenceNumber: data.object_data.permit_reference_number,
        highwayAuthority: data.object_data.highway_authority,
        highwayAuthoritySwaCode: data.object_data.highway_authority_swa_code,
        worksLocationCoordinates: data.object_data.works_location_coordinates ?? null,
        streetName: data.object_data.street_name ?? null,
        areaName: data.object_data.area_name ?? null,
        workCategory: data.object_data.work_category ?? null,
        trafficManagementType: data.object_data.traffic_management_type ?? null,
        proposedStartDateTime: data.object_data.proposed_start_date ?? null,
        proposedEndDateTime: data.object_data.proposed_end_date ?? null,
        actualStartDateTime: data.object_data.actual_start_date_time ?? null,
        actualEndDateTime: data.object_data.actual_end_date_time ?? null,
        workStatus: data.object_data.work_status ?? null,
        usrn: data.object_data.usrn ?? null,
        activityType: data.object_data.activity_type ?? null,
        worksLocationType: data.object_data.works_location_type ?? null,
        isTrafficSensitive: data.object_data.is_traffic_sensitive ?? null,
        permitStatus: data.object_data.permit_status ?? null,
        town: data.object_data.town ?? null,
        currentTrafficManagementType: data.object_data.current_traffic_management_type ?? null,
        currentTrafficManagementTypeUpdateDate: data.object_data.current_traffic_manage_type_update_date ?? null,
        lastUpdatedDatetime: data.event_time ?? null,
    }));

export type PermitMessage = z.infer<typeof permitMessageSchema>;
