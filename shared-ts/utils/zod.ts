import { ZodErrorMap, ZodSchema, z } from "zod";

export const setZodDefaultError: (errorMessage: string) => { errorMap: ZodErrorMap } = (errorMessage: string) => ({
    errorMap: (issue) => {
        switch (issue.code) {
            default:
                return { message: errorMessage };
        }
    },
});

const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/]\d{4}$/;
const timeRegex = /^([0-1][0-9]|2[0-3])[0-5][0-9]$/;
const minutesRegex = /^[0-9]{0,3}$/;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;

/**
 * Verify if the input value is of date format DD/MM/YYYY.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the input format is not DD/MM/YYYY.
 */

export const zodDate = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(dateRegex);

/**
 * Verify if the input value is of format hhmm where hh is 0-23 and mm is 0-59.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the regex match fails and the value
 *  is not of format hhmm.
 */
export const zodTime = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(timeRegex);

/**
 * Verify if the input value is a number between 0-999 minutes.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the regex match fails.
 */
export const zodTimeInMinutes = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(minutesRegex);

/**
 * Verify if the input value matches uuid regex expression
 * This is because the current version of Zod (3.21.4) does not support uuid version 7
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the input format is the regex match fails.
 */
export const zodUuid = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(uuidRegex);

/**
 * Returns a zod schema that can be used to filter out items that do not conform to the
 * given schema
 * @param {ZodSchema} schema Zod schema to use
 *
 * @returns {ZodSchema} Zod schema that can be used to filter out invalid items
 */
export const makeFilteredArraySchema = <T extends ZodSchema>(schema: T) =>
    z
        .array(z.unknown())
        .transform((items) => items?.filter((item): item is z.infer<T> => schema.safeParse(item).success));
