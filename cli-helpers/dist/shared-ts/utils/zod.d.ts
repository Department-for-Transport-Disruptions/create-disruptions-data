import { ZodErrorMap, ZodSchema, z } from "zod";
export declare const setZodDefaultError: (errorMessage: string) => {
    errorMap: ZodErrorMap;
};
export declare const makeZodArray: <T extends ZodSchema>(schema: T) => z.ZodArray<T, "many">;
/**
 * Verify if the input value is of date format DD/MM/YYYY.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the input format is not DD/MM/YYYY.
 */
export declare const zodDate: (defaultError?: string) => z.ZodString;
/**
 * Verify if the input value is of format hhmm where hh is 0-23 and mm is 0-59.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the regex match fails and the value
 *  is not of format hhmm.
 */
export declare const zodTime: (defaultError?: string) => z.ZodString;
/**
 * Verify if the input value is a number between 0-999 minutes.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the regex match fails.
 */
export declare const zodTimeInMinutes: (defaultError?: string) => z.ZodString;
/**
 * Verify if the input value matches uuid regex expression
 * This is because the current version of Zod (3.21.4) does not support uuid version 7
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the input format is the regex match fails.
 */
export declare const zodUuid: (defaultError?: string) => z.ZodString;
/**
 * Returns a zod schema that can be used to filter out items that do not conform to the
 * given schema
 * @param {ZodSchema} schema Zod schema to use
 *
 * @returns {ZodSchema} Zod schema that can be used to filter out invalid items
 */
export declare const makeFilteredArraySchema: <T extends ZodSchema>(schema: T) => z.ZodEffects<z.ZodArray<z.ZodUnknown, "many">, z.TypeOf<T>[], unknown[]>;
export declare const isValidTime: (time: string) => RegExpMatchArray | null;
export declare const nextdoorTokenSchema: z.ZodEffects<z.ZodObject<{
    token_type: z.ZodString;
    access_token: z.ZodString;
    id_token: z.ZodString;
    expires_in: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    token_type: string;
    access_token: string;
    id_token: string;
    expires_in: number;
}, {
    token_type: string;
    access_token: string;
    id_token: string;
    expires_in: number;
}>, {
    accessToken: string;
    tokenType: z.ZodString;
    idToken: z.ZodString;
    expiresIn: z.ZodNumber;
}, {
    token_type: string;
    access_token: string;
    id_token: string;
    expires_in: number;
}>;
export type NextdoorToken = z.infer<typeof nextdoorTokenSchema>;
