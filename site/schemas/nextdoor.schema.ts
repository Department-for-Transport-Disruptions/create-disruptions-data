import { z } from "zod";

export const nextdoorTokenSchema = z
    .object({
        token_type: z.string(),
        access_token: z.string(),
        id_token: z.string(),
        expires_in: z.number(),
    })
    .transform((res) => ({
        accessToken: res.access_token,
        tokenType: z.string(),
        idToken: z.string(),
        expiresIn: z.number(),
    }));

export const nextdoorMeSchema = z
    .object({
        id: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        profile_picture: z.string(),
        status: z.string(),
        account_creation_date: z.string(),
        agency_id: z.string(),
        agency_name: z.string(),
        agency_url_at_nextdoor: z.string(),
        agency_external_url: z.string(),
        agency_photo: z.string(),
        agency_city: z.string(),
        agency_state: z.string(),
    })
    .transform((res) => ({
        id: res.id,
        firstname: res.first_name,
        lastname: res.last_name,
        profilePicture: res.profile_picture,
        status: res.status,
        accountCreationDate: res.account_creation_date,
        agencyId: res.agency_id,
        agencyName: res.agency_name,
        agencyUrlAtNextdoor: res.agency_url_at_nextdoor,
        agencyExternalUrl: res.agency_external_url,
        agencyPhoto: res.agency_photo,
        agencyCity: res.agency_city,
        agencyState: res.agency_state,
    }));

export const nextdoorAgencyBoundaryResultSchema = z.array(
    z
        .object({
            name: z.string(),
            group_id: z.number(),
            geometry_id: z.number(),
            type: z.string(),
        })
        .transform((item) => ({
            name: item.name,
            groupId: item.group_id,
            geometryId: item.geometry_id,
            type: item.type,
        })),
);

export const nextdoorAgencyBoundaryInput = z.object({
    name: z.string(),
    groupId: z.coerce.number(),
});

export type NextdoorAgencyBoundaries = z.infer<typeof nextdoorAgencyBoundaryResultSchema>;
export type NextdoorAgencyBoundaryInput = z.infer<typeof nextdoorAgencyBoundaryInput>;

export const nextdoorGroupIdsSchema = z.string();
