import { Severity } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError, zodTimeInMinutes } from "../utils";

export const stopsImpactedSchema = z.object({
    id: z.number({
        required_error: "Id is required",
        invalid_type_error: "Id must be a number",
    }),
    atcoCode: z.string({
        required_error: "Atco code is required",
        invalid_type_error: "Atco code must be a string",
    }),
    naptanCode: z
        .string({
            required_error: "Naptan code is required",
            invalid_type_error: "Naptan code must be a string",
        })
        .optional(),
    commonName: z.string({
        required_error: "Common name is required",
        invalid_type_error: "Common name must be a string",
    }),
    street: z
        .string({
            required_error: "Street is required",
            invalid_type_error: "Street must be a string",
        })
        .optional(),
    indicator: z.string().optional(),
    bearing: z
        .string({
            required_error: "Bearing is required",
            invalid_type_error: "Bearing must be a string",
        })
        .optional(),
    nptgLocalityCode: z
        .string({
            required_error: "Nptg locality code is required",
            invalid_type_error: "Nptg locality code must be a string",
        })
        .optional(),
    localityName: z
        .string({
            required_error: "Locality name is required",
            invalid_type_error: "Locality name must be a string",
        })
        .optional(),
    parentLocalityName: z
        .string({
            required_error: "Parent locality name is required",
            invalid_type_error: "Parent locality name must be a string",
        })
        .optional(),
    longitude: z.string({
        required_error: "Longitude is required",
        invalid_type_error: "Longitude must be a string",
    }),
    latitude: z.string({
        required_error: "Latitude is required",
        invalid_type_error: "Latitude must be a string",
    }),
    stopType: z
        .string({
            required_error: "Stop type is required",
            invalid_type_error: "Stop type must be a string",
        })
        .optional(),
    busStopType: z
        .string({
            required_error: "Bus stop type is required",
            invalid_type_error: "Bus stop type must be a string",
        })
        .optional(),
    timingStatus: z
        .string({
            required_error: "Timing status is required",
            invalid_type_error: "Timing status must be a string",
        })
        .optional(),
    administrativeAreaCode: z
        .string({
            required_error: "Administrative area code is required",
            invalid_type_error: "Administrative area code must be a string",
        })
        .optional(),
    status: z
        .string({
            required_error: "Status is required",
            invalid_type_error: "Status must be a string",
        })
        .optional(),
});

export type Stop = z.infer<typeof stopsImpactedSchema>;

export const createConsequenceStopsSchema = z.object({
    stopsImpacted: stopsImpactedSchema
        .array()
        .optional()
        .refine((arr) => arr && arr.length >= 1, {
            path: ["stopsImpacted"],
            message: "At least one stop must be added",
        }),

    description: z.string(setZodDefaultError("Enter a description for this disruption")).min(1).max(500, {
        message: "Description must not exceed 500 characters",
    }),

    removeFromJourneyPlanners: z.union(
        [z.literal("yes"), z.literal("no")],
        setZodDefaultError("Select at least one option"),
    ),

    disruptionDelay: zodTimeInMinutes("Enter a number between 0 to 999 for disruption delay")
        .optional()
        .or(z.literal("")),

    disruptionSeverity: z.union(
        [
            z.literal(Severity.unknown),
            z.literal(Severity.verySlight),
            z.literal(Severity.slight),
            z.literal(Severity.normal),
            z.literal(Severity.severe),
            z.literal(Severity.verySevere),
        ],
        setZodDefaultError("Select the severity from the dropdown"),
    ),
});
