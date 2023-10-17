import { Dayjs } from "dayjs";
import { getDatetimeFromDateAndTime, getFormattedDate } from "./dates";
import { CleanedDisruption } from "../../packages/siri-sx-generator";
import { Disruption, Validity } from "../disruptionTypes";

export const notEmpty = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

export const sortDisruptionsByStartDate = (disruptions: Disruption[]): Disruption[] => {
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

export const getSortedDisruptionFinalEndDate = (disruption: Disruption | CleanedDisruption): Dayjs | null => {
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
