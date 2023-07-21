import { Dayjs } from "dayjs";
import lowerCase from "lodash/lowerCase";
import startCase from "lodash/startCase";
import upperFirst from "lodash/upperFirst";
import { NextApiResponse, NextPageContext } from "next";
import { z, ZodError, ZodErrorMap } from "zod";
import { ServerResponse } from "http";
import { getDatetimeFromDateAndTime, getFormattedDate } from "./dates";
import { DisplayValuePair, ErrorInfo } from "../interfaces";
import {
    Service,
    Consequence,
    NetworkConsequence,
    OperatorConsequence,
    StopsConsequence,
    ServicesConsequence,
} from "../schemas/consequence.schema";
import { Validity } from "../schemas/create-disruption.schema";
import { Disruption } from "../schemas/disruption.schema";

export type SortedDisruption = Omit<
    Disruption,
    | "disruptionStartDate"
    | "disruptionStartTime"
    | "disruptionEndDate"
    | "disruptionEndTime"
    | "disruptionNoEndDateTime"
>;

export const getSortedDisruptionFinalEndDate = (disruption: SortedDisruption | Disruption): Dayjs | null => {
    let disruptionEndDate: Dayjs | null = null;

    if (!disruption.validity) {
        throw new Error("Validity missing");
    }

    let noEndDatesFound = false;

    disruption.validity.forEach((validity) => {
        if (!noEndDatesFound) {
            const repeatsEndDate =
                (validity.disruptionRepeats === "daily" || validity.disruptionRepeats === "weekly") &&
                validity.disruptionRepeatsEndDate
                    ? getFormattedDate(validity.disruptionRepeatsEndDate)
                    : validity.disruptionEndDate && validity.disruptionEndTime
                    ? getDatetimeFromDateAndTime(validity.disruptionEndDate, validity.disruptionEndTime)
                    : null;

            if (repeatsEndDate && (repeatsEndDate.isAfter(disruptionEndDate) || disruptionEndDate === null)) {
                disruptionEndDate = repeatsEndDate;
            } else if (!repeatsEndDate) {
                disruptionEndDate = null;
                noEndDatesFound = true;
            }
        }
    });

    return disruptionEndDate;
};

export const sortDisruptionsByStartDate = (disruptions: Disruption[]): SortedDisruption[] => {
    const sortEarliestDate = (firstDate: Dayjs, secondDate: Dayjs) => (firstDate.isBefore(secondDate) ? -1 : 1);

    const disruptionsWithSortedValidityPeriods = disruptions.map((disruption) => {
        const validityPeriods: Validity[] = [
            ...(disruption.validity ?? []),
            {
                disruptionStartDate: disruption.disruptionStartDate,
                disruptionStartTime: disruption.disruptionStartTime,
                disruptionEndDate: disruption.disruptionEndDate,
                disruptionEndTime: disruption.disruptionEndTime,
                disruptionNoEndDateTime: disruption.disruptionNoEndDateTime,
                disruptionRepeats: disruption.disruptionRepeats,
                disruptionRepeatsEndDate: disruption.disruptionRepeatsEndDate,
            },
        ];

        const sortedValidityPeriods = validityPeriods.sort((a, b) => {
            return sortEarliestDate(
                getDatetimeFromDateAndTime(a.disruptionStartDate, a.disruptionStartTime),
                getDatetimeFromDateAndTime(b.disruptionStartDate, b.disruptionStartTime),
            );
        });

        return { ...disruption, validity: sortedValidityPeriods };
    });

    return disruptionsWithSortedValidityPeriods.sort((a, b) => {
        const aTime = getDatetimeFromDateAndTime(a.validity[0].disruptionStartDate, a.validity[0].disruptionStartTime);
        const bTime = getDatetimeFromDateAndTime(b.validity[0].disruptionStartDate, b.validity[0].disruptionStartTime);

        return sortEarliestDate(aTime, bTime);
    });
};

export const mapValidityPeriods = (disruption: SortedDisruption) =>
    disruption.validity?.map((period) => ({
        startTime: getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).toISOString(),
        endTime:
            period.disruptionEndDate && period.disruptionEndTime
                ? getDatetimeFromDateAndTime(period.disruptionEndDate, period.disruptionEndTime).toISOString()
                : null,
    })) ?? [];

export const reduceStringWithEllipsis = (input: string, maximum: number): string => {
    if (input.length < maximum) {
        return input;
    }

    return `${input.substring(0, maximum)}...`;
};

export const notEmpty = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

export const buildTitle = (errors: ErrorInfo[], title: string): string => {
    if (errors.length > 0) {
        return `Error: ${title}`;
    }

    return title;
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const getCsrfToken = (ctx: NextPageContext | NextPageContext): string =>
    ctx.res?.getHeader("x-csrf-token")?.toString() ?? "missing";

export const splitCamelCaseToString = (s: string) => upperFirst(lowerCase(startCase(s)));

export const getDisplayByValue = (items: DisplayValuePair[], value: string) =>
    items.find((item) => item.value === value)?.display;

export const getServiceLabel = (service: Service) =>
    `${service.lineName} - ${service.origin} - ${service.destination} (${service.operatorShortName})`;

export const isFullConsequence = (consequence: unknown): consequence is Consequence =>
    !!(consequence as Consequence).description;

export const isNetworkConsequence = (consequence: unknown): consequence is NetworkConsequence =>
    isFullConsequence(consequence) && consequence.consequenceType === "networkWide";

export const isOperatorConsequence = (consequence: unknown): consequence is OperatorConsequence =>
    isFullConsequence(consequence) && consequence.consequenceType === "operatorWide";

export const isStopsConsequence = (consequence: unknown): consequence is StopsConsequence =>
    isFullConsequence(consequence) && consequence.consequenceType === "stops";

export const isServicesConsequence = (consequence: unknown): consequence is ServicesConsequence =>
    isFullConsequence(consequence) && consequence.consequenceType === "services";

export const getLargestConsequenceIndex = (disruption: Disruption) => {
    const largestConsequenceIndex =
        disruption.consequences && disruption.consequences.length > 0
            ? disruption.consequences?.reduce((p, c) => (p.consequenceIndex > c.consequenceIndex ? p : c))
                  .consequenceIndex
            : 0;

    const largestDeletedConsequenceIndex =
        disruption.deletedConsequences && disruption.deletedConsequences.length > 0
            ? disruption.deletedConsequences?.reduce((p, c) => (p.consequenceIndex > c.consequenceIndex ? p : c))
                  .consequenceIndex
            : 0;

    return Math.max(largestConsequenceIndex, largestDeletedConsequenceIndex);
};

// Zod
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
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i

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

export const flattenZodErrors = (errors: ZodError) =>
    Object.values(
        errors.flatten<ErrorInfo>((val) => ({
            errorMessage: val.message,
            id: val.path.at(-1)?.toString() ?? "",
        })).fieldErrors,
    )
        .map((item) => item?.[0] ?? null)
        .filter(notEmpty);
/**
 * Verify if the input value is a number between 0-999 minutes.
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the regex match fails.
 */
export const zodTimeInMinutes = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(minutesRegex);

/**
 * Verify if the input value matches uuid regex expression. 
 * This is because the current version of Zod (3.21.4) does not support uuid version 7
 * @param {defaultError} defaultError Error message when the validation fails.
 *
 * @returns {z.ZodString} Indicates an error if the input format is the regex match fails.
 */
export const zodUuid = (defaultError?: string) =>
    z.string(defaultError ? setZodDefaultError(defaultError) : {}).regex(uuidRegex);

export const sortServices = (services: Service[]) => {
    return services.sort((a, b) => {
        return (
            a.lineName.localeCompare(b.lineName, "en", { numeric: true }) ||
            a.origin.localeCompare(b.origin) ||
            a.destination.localeCompare(b.destination) ||
            a.operatorShortName.localeCompare(b.operatorShortName)
        );
    });
};

export const toLowerStartCase = (text: string) => startCase(text.toLowerCase());



