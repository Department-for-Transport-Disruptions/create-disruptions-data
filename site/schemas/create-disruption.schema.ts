import {
    environmentReasonSchema,
    equipmentReasonSchema,
    miscellaneousReasonSchema,
    personnelReasonSchema,
} from "@create-disruptions-data/shared-ts/siriTypes.zod";
import cryptoRandomString from "crypto-random-string";
import dayjs from "dayjs";
import { z } from "zod";
import { setZodDefaultError, zodDate, zodTime } from "../utils";
import { checkOverlap, getDatetimeFromDateAndTime, getFormattedDate } from "../utils/dates";

export const validitySchema = z.object({
    disruptionStartDate: zodDate("Enter a start date for the disruption"),
    disruptionStartTime: zodTime("Enter a start time for the disruption"),
    disruptionEndDate: zodDate("Invalid disruption end date").optional().or(z.literal("")),
    disruptionEndTime: zodTime("Invalid disruption end time").optional().or(z.literal("")),
    disruptionNoEndDateTime: z.union([z.literal("true"), z.literal("")]).optional(),
    disruptionRepeats: z.union([z.literal("doesntRepeat"), z.literal("daily"), z.literal("weekly")]).optional(),
    disruptionRepeatsEndDate: zodDate("Invalid disruption end date").optional().or(z.literal("")),
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
    .refine((val) => val.disruptionEndDate || val.disruptionEndTime || val.disruptionNoEndDateTime, {
        path: ["disruptionNoEndDateTime"],
        message: '"No end date/time" should be selected or a disruption date and time should be entered',
    })
    .refine(
        (val) => {
            if (val.disruptionRepeats === "daily" && !val.disruptionRepeatsEndDate) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The ending on date must be provided",
        },
    )
    .refine(
        (val) => {
            if (val.disruptionRepeats === "weekly" && !val.disruptionRepeatsEndDate) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The ending on date must be provided",
        },
    )
    .refine(
        (val) => {
            if (!val.disruptionNoEndDateTime && !val.disruptionEndDate) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionEndDate"],
            message: "Enter an end date",
        },
    )
    .refine(
        (val) => {
            if (!val.disruptionNoEndDateTime && !val.disruptionEndTime) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionEndTime"],
            message: "Enter an end time",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionRepeats === "daily" &&
                val.disruptionEndDate &&
                val.disruptionRepeatsEndDate &&
                getFormattedDate(val.disruptionEndDate).isSameOrAfter(getFormattedDate(val.disruptionRepeatsEndDate))
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The ending on date must be after the end date",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionRepeats === "weekly" &&
                val.disruptionEndDate &&
                val.disruptionRepeatsEndDate &&
                getFormattedDate(val.disruptionEndDate).isSameOrAfter(getFormattedDate(val.disruptionRepeatsEndDate))
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The ending on date must be after the end date",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionRepeats === "daily" &&
                val.disruptionRepeatsEndDate &&
                getFormattedDate(val.disruptionRepeatsEndDate).isSameOrAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime).add(365, "day"),
                )
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The repeat ending on must be within one year of the start date",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionRepeats === "weekly" &&
                val.disruptionRepeatsEndDate &&
                getFormattedDate(val.disruptionRepeatsEndDate).isSameOrAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime).add(365, "day"),
                )
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The repeat ending on must be within one year of the start date",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionEndDate &&
                val.disruptionEndTime &&
                val.disruptionRepeats === "daily" &&
                getDatetimeFromDateAndTime(val.disruptionEndDate, val.disruptionEndTime).isSameOrAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime).add(24, "hours"),
                )
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionEndDate"],
            message: "The date range must be within 24 hours for daily repetitions",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionEndDate &&
                val.disruptionEndTime &&
                val.disruptionRepeats === "weekly" &&
                getDatetimeFromDateAndTime(val.disruptionEndDate, val.disruptionEndTime).isSameOrAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime).add(7, "day"),
                )
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionEndDate"],
            message: "The date range must be within 7 days for weekly repetitions",
        },
    );

export const createDisruptionSchema = z.object({
    disruptionId: z.string().uuid(),
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
        .max(250, {
            message: "Associated link must not exceed 250 characters",
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
    disruptionStartDate: zodDate("Enter a validity start date for the disruption"),
    disruptionStartTime: zodTime("Enter a validity start time for the disruption"),
    disruptionEndDate: zodDate("Invalid publish end date").optional().or(z.literal("")),
    disruptionEndTime: zodTime("Invalid publish end date").optional().or(z.literal("")),
    disruptionNoEndDateTime: z.union([z.literal("true"), z.literal("")]).optional(),
    disruptionRepeats: z.union([z.literal("doesntRepeat"), z.literal("daily"), z.literal("weekly")]).optional(),
    disruptionRepeatsEndDate: zodDate("Invalid disruption end date").optional().or(z.literal("")),
    validity: z
        .array(validitySchemaRefined)
        .refine((arr) => !arr.some((val) => val.disruptionNoEndDateTime === "true"), {
            path: ["disruptionStartDate"],
            message: "A validity period with no end time must be the last validity",
        })
        .optional(),
    displayId: z
        .string()
        .optional()
        .default(cryptoRandomString({ length: 6 })),
});

export const createDisruptionsSchemaRefined = createDisruptionSchema
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
    .refine(
        (val) => {
            if (val.disruptionNoEndDateTime) {
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
    .refine(
        (val) => {
            if (!val.disruptionNoEndDateTime) {
                return !!val.publishEndDate;
            }

            return true;
        },
        {
            path: ["publishEndDate"],
            message: "Enter an end date for the disruption",
        },
    )
    .refine(
        (val) => {
            if (!val.disruptionNoEndDateTime) {
                return !!val.publishEndTime;
            }

            return true;
        },
        {
            path: ["publishEndTime"],
            message: "Enter an end time for the disruption",
        },
    )
    .refine(
        (val) => {
            if (val.disruptionRepeats === "daily" && !val.disruptionRepeatsEndDate) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The ending on date must be provided",
        },
    )
    .refine(
        (val) => {
            if (val.disruptionRepeats === "weekly" && !val.disruptionRepeatsEndDate) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The ending on date must be provided",
        },
    )
    .refine(
        (val) => {
            if (!val.disruptionNoEndDateTime && !val.disruptionEndDate) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionEndDate"],
            message: "Enter an end date",
        },
    )
    .refine(
        (val) => {
            if (!val.disruptionNoEndDateTime && !val.disruptionEndTime) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionEndTime"],
            message: "Enter an end time",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionRepeats === "daily" &&
                val.disruptionEndDate &&
                val.disruptionRepeatsEndDate &&
                getFormattedDate(val.disruptionEndDate).isSameOrAfter(getFormattedDate(val.disruptionRepeatsEndDate))
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The ending on date must be after the end date",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionRepeats === "weekly" &&
                val.disruptionEndDate &&
                val.disruptionRepeatsEndDate &&
                getFormattedDate(val.disruptionEndDate).isSameOrAfter(getFormattedDate(val.disruptionRepeatsEndDate))
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The ending on date must be after the end date",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionRepeats === "daily" &&
                val.disruptionRepeatsEndDate &&
                getFormattedDate(val.disruptionRepeatsEndDate).isSameOrAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime).add(365, "day"),
                )
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The repeat ending on must be within one year of the start date",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionRepeats === "weekly" &&
                val.disruptionRepeatsEndDate &&
                getFormattedDate(val.disruptionRepeatsEndDate).isSameOrAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime).add(365, "day"),
                )
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionRepeatsEndDate"],
            message: "The repeat ending on must be within one year of the start date",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionEndDate &&
                val.disruptionEndTime &&
                val.disruptionRepeats === "daily" &&
                getDatetimeFromDateAndTime(val.disruptionEndDate, val.disruptionEndTime).isSameOrAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime).add(24, "hours"),
                )
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionEndDate"],
            message: "The date range must be within 24 hours for daily repetitions",
        },
    )
    .refine(
        (val) => {
            if (
                !val.disruptionNoEndDateTime &&
                val.disruptionEndDate &&
                val.disruptionEndTime &&
                val.disruptionRepeats === "weekly" &&
                getDatetimeFromDateAndTime(val.disruptionEndDate, val.disruptionEndTime).isSameOrAfter(
                    getDatetimeFromDateAndTime(val.disruptionStartDate, val.disruptionStartTime).add(7, "day"),
                )
            ) {
                return false;
            }
            return true;
        },
        {
            path: ["disruptionEndDate"],
            message: "The date range must be within 7 days for weekly repetitions",
        },
    )
    .refine(
        (val) => {
            const {
                validity = [],
                disruptionStartDate,
                disruptionStartTime,
                disruptionEndDate,
                disruptionEndTime,
                disruptionRepeats,
                disruptionRepeatsEndDate,
            } = val;

            const combinedValidity: Validity[] = [
                ...validity,
                {
                    disruptionStartDate,
                    disruptionStartTime,
                    disruptionEndDate,
                    disruptionEndTime,
                    disruptionRepeats,
                    disruptionRepeatsEndDate,
                },
            ];

            for (let i = 0; i < combinedValidity.length; i++) {
                for (let j = i + 1; j < combinedValidity.length; j++) {
                    if (
                        /* Equivalent to checkOverlap(firstStartDate: dayjs.Dayjs,
                         *                             firstEndDate: dayjs.Dayjs,
                         *                             secondStartDate: dayjs.Dayjs,
                         *                             secondEndDate: dayjs.Dayjs)
                         *  The ternary operator is to accommodate when "No end date/time" is selected for a validity */
                        checkOverlap(
                            getDatetimeFromDateAndTime(
                                combinedValidity[i].disruptionStartDate,
                                combinedValidity[i].disruptionStartTime,
                            ),
                            combinedValidity[i].disruptionEndDate
                                ? getDatetimeFromDateAndTime(
                                      combinedValidity[i].disruptionEndDate || "",
                                      combinedValidity[i].disruptionEndTime || "",
                                  )
                                : dayjs().add(100, "year"),
                            getDatetimeFromDateAndTime(
                                combinedValidity[j].disruptionStartDate,
                                combinedValidity[j].disruptionStartTime,
                            ),
                            combinedValidity[j].disruptionEndDate
                                ? getDatetimeFromDateAndTime(
                                      combinedValidity[j].disruptionEndDate || "",
                                      combinedValidity[j].disruptionEndTime || "",
                                  )
                                : dayjs().add(100, "year"),
                        )
                    ) {
                        return false;
                    }
                }
            }
            return true;
        },
        {
            path: ["disruptionStartDate"],
            message: "Validity periods cannot overlap",
        },
    )
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
    .refine((val) => val.disruptionEndDate || val.disruptionEndTime || val.disruptionNoEndDateTime, {
        path: ["disruptionNoEndDateTime"],
        message: '"No end date/time" should be selected or a disruption date and time should be entered',
    })
    .superRefine((val, ctx) => {
        const {
            validity = [],
            disruptionStartDate,
            disruptionStartTime,
            disruptionEndDate,
            disruptionEndTime,
            disruptionRepeats,
            disruptionRepeatsEndDate,
            publishStartDate,
            publishStartTime,
            publishEndDate,
            publishEndTime,
        } = val;

        const combinedValidity = [
            ...validity,
            {
                disruptionStartDate,
                disruptionStartTime,
                disruptionEndDate,
                disruptionEndTime,
                disruptionRepeats,
                disruptionRepeatsEndDate,
            },
        ];

        const sortedValidity = combinedValidity.sort((a, b) => {
            return getDatetimeFromDateAndTime(a.disruptionStartDate, a.disruptionStartTime).isBefore(
                getDatetimeFromDateAndTime(b.disruptionStartDate, b.disruptionStartTime),
            )
                ? -1
                : 1;
        });

        if (
            getDatetimeFromDateAndTime(publishStartDate, publishStartTime).isAfter(
                getDatetimeFromDateAndTime(
                    sortedValidity[0].disruptionStartDate,
                    sortedValidity[0].disruptionStartTime,
                ),
            )
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "The publishing period must start before the first validity period",
                path: ["publishStartDate"],
            });
        }

        let maxEndDate =
            sortedValidity && sortedValidity[sortedValidity.length - 1].disruptionEndDate
                ? getFormattedDate(sortedValidity[sortedValidity.length - 1].disruptionEndDate || "")
                : dayjs().subtract(100, "year");

        for (let i = 0; i < sortedValidity.length; i++) {
            if (
                (sortedValidity[i].disruptionRepeats === "daily" || sortedValidity[i].disruptionRepeats === "weekly") &&
                sortedValidity[i].disruptionRepeatsEndDate
            ) {
                const repeatsEndDate = getFormattedDate(sortedValidity[i].disruptionRepeatsEndDate || "");

                if (repeatsEndDate.isAfter(maxEndDate)) maxEndDate = repeatsEndDate;
            }
        }

        if (
            publishEndDate &&
            publishEndTime &&
            getDatetimeFromDateAndTime(publishEndDate, publishEndTime).isBefore(maxEndDate)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "The publishing period must end after the last validity period",
                path: ["publishEndDate"],
            });
        }
    });

export type DisruptionInfo = z.infer<typeof createDisruptionSchema>;
