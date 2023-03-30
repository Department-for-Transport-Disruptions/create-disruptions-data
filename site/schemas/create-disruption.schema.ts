import {
    environmentReasonSchema,
    equipmentReasonSchema,
    miscellaneousReasonSchema,
    personnelReasonSchema,
} from "@create-disruptions-data/shared-ts/siriTypes.zod";
import { z } from "zod";
import { setZodDefaultError, zodDate, zodTime } from "../utils";
import { getDatetimeFromDateAndTime } from "../utils/dates";

export const validitySchema = z.object({
    disruptionStartDate: zodDate("Enter a start date for the disruption"),
    disruptionStartTime: zodTime("Enter a start time for the disruption"),
    disruptionEndDate: zodDate("Invalid disruption end date").optional().or(z.literal("")),
    disruptionEndTime: zodTime("Invalid disruption end time").optional().or(z.literal("")),
    disruptionNoEndDateTime: z.union([z.literal("true"), z.literal("")]).optional(),
});

export type Validity = z.infer<typeof validitySchema>;

export const validitySchemaRefined = validitySchema
    .refine(
        (val) => {
            if (val.disruptionNoEndDateTime) {
                return !val.disruptionEndDate && !val.disruptionEndTime;
            }

            return true;
        },
        {
            path: ["disruptionNoEndDateTime"],
            message: '"No end date/time" should not be selected when a disruption date and time have been entered',
        },
    )
    .refine((val) => (val.disruptionEndDate ? !!val.disruptionEndTime : true), {
        path: ["disruptionEndTime"],
        message: "Disruption end time must be set when end date is set",
    })
    .refine((val) => (val.disruptionEndTime ? !!val.disruptionEndDate : true), {
        path: ["disruptionEndDate"],
        message: "Disruption end date must be set when end time is set",
    })
    .refine(
        (val) => {
            if (val.disruptionEndDate && val.disruptionEndTime) {
                return getDatetimeFromDateAndTime(val.disruptionEndDate, val.disruptionEndTime).isAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime),
                );
            }

            return true;
        },
        {
            path: ["disruptionEndDate"],
            message: "Disruption end datetime must be after start datetime",
        },
    )
    .refine((val) => val.disruptionEndDate || val.disruptionEndTime || val.disruptionNoEndDateTime, {
        path: ["disruptionNoEndDateTime"],
        message: '"No end date/time" should be selected or a disruption date and time should be entered',
    });

export const createDisruptionSchema = z.object({
    disruptionType: z.union(
        [z.literal("planned"), z.literal("unplanned")],
        setZodDefaultError("Select a disruption type"),
    ),
    summary: z.string(setZodDefaultError("Enter a summary for this disruption")).min(1).max(100, {
        message: "Summary must not exceed 100 characters",
    }),
    description: z.string(setZodDefaultError("Enter a description for this disruption")).min(1).max(500, {
        message: "Description must not exceed 500 characters",
    }),
    associatedLink: z
        .string()
        .url({
            message: "Associated link must be a valid URL",
        })
        .max(500, {
            message: "Associated link must not exceed 500 characters",
        })
        .optional()
        .or(z.literal("")),
    disruptionReason: z.union(
        [miscellaneousReasonSchema, environmentReasonSchema, personnelReasonSchema, equipmentReasonSchema],
        setZodDefaultError("Select a reason from the dropdown"),
    ),
    publishStartDate: zodDate("Enter a publish start date for the disruption"),
    publishStartTime: zodTime("Enter a publish start time for the disruption"),
    publishEndDate: zodDate("Invalid publish end date").optional().or(z.literal("")),
    publishEndTime: zodTime("Invalid publish end date").optional().or(z.literal("")),
    publishNoEndDateTime: z.union([z.literal("true"), z.literal("")]).optional(),
    disruptionStartDate: zodDate("Enter a validity start date for the disruption"),
    disruptionStartTime: zodTime("Enter a validity start time for the disruption"),
    disruptionEndDate: zodDate("Invalid publish end date").optional().or(z.literal("")),
    disruptionEndTime: zodTime("Invalid publish end date").optional().or(z.literal("")),
    disruptionNoEndDateTime: z.union([z.literal("true"), z.literal("")]).optional(),
    validity: z
        .array(validitySchemaRefined)
        .refine((arr) => !arr.some((val) => val.disruptionNoEndDateTime === "true"), {
            path: ["disruptionStartDate"],
            message: "A validity period with no end time must be the last validity",
        })
        .optional(),
});

export const createDisruptionsSchemaRefined = createDisruptionSchema
    .refine(
        (val) => {
            if (val.publishNoEndDateTime) {
                return !val.publishEndDate && !val.publishEndTime;
            }

            return true;
        },
        {
            path: ["disruptionNoEndDateTime"],
            message: '"No end date/time" should not be selected when a publish date and time have been entered',
        },
    )
    .refine((val) => (val.publishEndDate ? !!val.publishEndTime : true), {
        path: ["publishEndTime"],
        message: "Publish end time must be set when end date is set",
    })
    .refine((val) => (val.publishEndTime ? !!val.publishEndDate : true), {
        path: ["publishEndDate"],
        message: "Publish end date must be set when end time is set",
    })

    .refine(
        (val) => {
            if (val.publishEndDate && val.publishEndTime) {
                return getDatetimeFromDateAndTime(val.publishEndDate, val.publishEndTime).isAfter(
                    getDatetimeFromDateAndTime(val.publishStartDate, val.publishStartTime),
                );
            }

            return true;
        },
        {
            path: ["publishEndDate"],
            message: "Publish end datetime must be after start datetime",
        },
    )
    .refine((val) => val.publishEndDate || val.publishEndTime || val.publishNoEndDateTime, {
        path: ["publishNoEndDateTime"],
        message: '"No end date/time" should be selected or a publish date and time should be entered',
    })
    .refine(
        (val) => {
            const {
                validity = [],
                disruptionStartDate,
                disruptionStartTime,
                disruptionEndDate,
                disruptionEndTime,
            } = val;

            const combinedValidity = [
                ...validity,
                {
                    disruptionStartDate,
                    disruptionStartTime,
                    disruptionEndDate,
                    disruptionEndTime,
                },
            ];

            let valid = true;
            for (let i = 0; i < combinedValidity.length; i++) {
                for (let j = i + 1; j < combinedValidity.length; j++) {
                    const endDate = combinedValidity[i].disruptionEndDate;
                    const endTime = combinedValidity[i].disruptionEndTime;

                    if (endDate && endTime) {
                        if (
                            getDatetimeFromDateAndTime(
                                combinedValidity[j].disruptionStartDate,
                                combinedValidity[j].disruptionStartTime,
                            ).isBefore(getDatetimeFromDateAndTime(endDate, endTime))
                        ) {
                            valid = false;
                        }
                    }
                }
            }
            return valid;
        },
        {
            path: ["disruptionStartDate"],
            message: "Validity periods cannot overlap",
        },
    );

export type Disruption = z.infer<typeof createDisruptionSchema>;
