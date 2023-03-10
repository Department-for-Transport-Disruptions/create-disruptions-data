import {
    EnvironmentReason,
    EquipmentReason,
    MiscellaneousReason,
    PersonnelReason,
} from "@create-disruptions-data/shared-ts/siriTypes";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NextApiResponse } from "next";
import { DISRUPTION_TYPES, CD_DATE_FORMAT } from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { DisruptionType } from "../../pages/api/create-disruption";
import { redirectTo } from "../index";

dayjs.extend(customParseFormat);

export const checkReferrer = (
    referrerHeader: string | undefined,
    requestFromPath: string,
    errorPath: string,
    res: NextApiResponse,
) => {
    if (!referrerHeader?.includes(requestFromPath)) {
        redirectTo(res, errorPath);
    }
};

export const validateSummary = (summary: string, errors: ErrorInfo[], errorId: string) => {
    const summaryRequiredErr: ErrorInfo = {
        id: errorId,
        errorMessage: "Enter a summary for this disruption",
    };

    if (!requireFieldCheck(summary)) {
        errors.push(summaryRequiredErr);
    } else {
        const lengthErr: ErrorInfo = {
            id: errorId,
            errorMessage: "Enter a Summary of less than 100 characters",
        };

        if (!validateLength(summary, 100)) {
            errors.push(lengthErr);
        }
    }
};

export const validateDisruptionType = (disruptionType: DisruptionType | "", errors: ErrorInfo[], errorId: string) => {
    const disruptionTypeRequiredErr: ErrorInfo = {
        id: errorId,
        errorMessage: "Choose a Type of Disruption",
    };

    if (!requireFieldCheck(disruptionType)) {
        errors.push(disruptionTypeRequiredErr);
    } else {
        const invalidTypeErr: ErrorInfo = {
            id: errorId,
            errorMessage: "Invalid Disruption Type Selected. Choose a valid Type of Disruption",
        };

        if (!Object.values(DISRUPTION_TYPES).includes(disruptionType as string)) {
            errors.push(invalidTypeErr);
        }
    }
};

export const requireFieldCheck = (field: unknown | undefined): boolean => {
    let checkPassed = false;
    if (field) {
        checkPassed = true;
    }

    return checkPassed;
};

export const validateLength = (field: string, length: number): boolean => {
    let isValid = false;
    if (field?.length <= length) {
        isValid = true;
    }

    return isValid;
};

export const validateDescription = (description: string, errors: ErrorInfo[], errorId: string) => {
    const descriptionRequiredErr: ErrorInfo = {
        id: errorId,
        errorMessage: "Enter a description for this disruption (200 characters maximum)",
    };

    if (!requireFieldCheck(description)) {
        errors.push(descriptionRequiredErr);
    } else {
        const error: ErrorInfo = {
            id: errorId,
            errorMessage: "Enter a Description of less than 200 characters",
        };
        if (!validateLength(description, 200)) {
            errors.push(error);
        }
    }
};

export const validateAssociatedLink = (associatedLink: string, errors: ErrorInfo[], errorId: string) => {
    try {
        new URL(associatedLink);
    } catch (_) {
        errors.push({
            id: errorId,
            errorMessage: "The URL is malformed. Enter a valid URL",
        });
    }
};

export const validateDisruptionReasons = (disruptionReason: string, errors: ErrorInfo[], errorId: string) => {
    let error: ErrorInfo = {
        id: errorId,
        errorMessage: "Select a reason from the dropdown",
    };

    if (!requireFieldCheck(disruptionReason)) {
        errors.push(error);
    } else {
        error = {
            id: errorId,
            errorMessage: "Invalid value provided for Reason for Disruption",
        };

        if (
            Object.values(MiscellaneousReason).filter((value: string) => value === disruptionReason).length === 0 &&
            Object.values(EnvironmentReason).filter((value: string) => value === disruptionReason).length === 0 &&
            Object.values(PersonnelReason).filter((value: string) => value === disruptionReason).length === 0 &&
            Object.values(EquipmentReason).filter((value: string) => value === disruptionReason).length === 0
        ) {
            errors.push(error);
        }
    }
};

export const validateDateTime = (
    date: string,
    time: string,
    errors: ErrorInfo[],
    errorId: string,
    dateType: string,
): boolean => {
    let isValid = false;

    const timeCheck = requireFieldCheck(time);
    if (!date) {
        errors.push({
            id: errorId,
            errorMessage: `No ${dateType} date selected. Select a valid ${dateType} date`,
        });
    }

    if (!timeCheck) {
        errors.push({
            id: errorId,
            errorMessage: `No ${dateType} time entered. Select a valid ${dateType} time`,
        });
    }

    if (date && timeCheck) {
        const jsDate = dayjs(date, CD_DATE_FORMAT, "en-gb", true);
        const isValidTime = validateTime(time, dateType, errors, errorId);

        if (!jsDate.isValid()) {
            errors.push({
                id: errorId,
                errorMessage: `Invalid ${dateType} Date value submitted. Select a valid ${dateType} date`,
            });
        } else {
            // Validate that the start time input is valid and of time format
            const isFutureDate = jsDate.hour(+time.slice(0, 2)).minute(+time.slice(2, 4)).isAfter(dayjs());

            if (isValidTime && !isFutureDate) {
                errors.push({
                    id: errorId,
                    errorMessage: `The ${dateType} date and time should be past the current date and time`,
                });
            } else {
                isValid = isValidTime;
            }
        }
    }

    return isValid;
};

export const validateTime = (time: string, dateType: string, errors: ErrorInfo[], errorId: string): boolean => {
    let isValid = false;

    if (time.length != 4 || isNaN(+time) || !(+time.slice(0, 2) < 24) || !(+time.slice(2, 4) < 60)) {
        errors.push({
            id: errorId,
            errorMessage: `Value for ${dateType} time is of invalid format. Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm`,
        });
    } else {
        isValid = true;
    }

    return isValid;
};

export const getDateTime = (date: string, time?: string): dayjs.Dayjs => {
    let formattedDate: dayjs.Dayjs = dayjs(date, CD_DATE_FORMAT, true);
    if (time) formattedDate = formattedDate.hour(+time.slice(0, 2)).minute(+time.slice(2, 4));
    return formattedDate;
};

export const validateDateTimeSection = (
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    isEndDateRequired: string | undefined,
    errors: ErrorInfo[],
    errorId: string,
) => {
    validateDateTime(startDate, startTime, errors, errorId, "Start");
    if (!isEndDateRequired) {
        const isValid = validateDateTime(endDate, endTime, errors, errorId, "End");
        const jsEndDateTime: dayjs.Dayjs = getDateTime(endDate, endTime);
        const jsStartDateTime: dayjs.Dayjs = getDateTime(startDate, startTime);

        if (isValid && jsEndDateTime.isBefore(jsStartDateTime)) {
            errors.push({
                id: errorId,
                errorMessage: "End Date and time cannot be before the  Start Date and time. Update End Date and time",
            });
        }
    }
};
