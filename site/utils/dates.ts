import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CD_DATE_FORMAT } from "../constants";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Europe/London");

export const convertDateTimeToFormat = (dateOrTime: string | Date, format: string = CD_DATE_FORMAT) => {
    return dayjs(dateOrTime).format(format);
};

export const getDate = (input?: string) => dayjs(!!input ? input : undefined);

export const getFormattedDate = (date: string | Date) => dayjs(date, "DD/MM/YYYY");

export const formatTime = (time: string) => (time.length === 4 ? time.slice(0, -2) + ":" + time.slice(-2) : time);

export const getDatetimeFromDateAndTime = (date: string, time: string) => dayjs(`${date} ${time}`, "DD/MM/YYYY HHmm");

export const getFutureDateAsString = (addDays: number, dateFormat = CD_DATE_FORMAT) => {
    return dayjs().add(addDays, "day").format(dateFormat).toString();
};
export const checkOverlap = (
    firstStartDate: dayjs.Dayjs,
    firstEndDate: dayjs.Dayjs,
    secondStartDate: dayjs.Dayjs,
    secondEndDate: dayjs.Dayjs,
) => {
    return (
        firstStartDate.isBetween(secondStartDate, secondEndDate) ||
        secondStartDate.isBetween(firstStartDate, firstEndDate) ||
        firstStartDate.isSame(secondStartDate)
    );
};

export const getEndingOnDateText = (
    disruptionRepeats: string | undefined,
    disruptionRepeatsEndDate: string | undefined,
    disruptionStartDate?: string,
    disruptionEndDate?: string,
) => {
    if (disruptionRepeats === "weekly" && disruptionStartDate && disruptionRepeatsEndDate && disruptionEndDate) {
        const startDateDay = getFormattedDate(disruptionStartDate).day();
        const endDateDay = getFormattedDate(disruptionEndDate).day();
        const endingOnDateDay = getFormattedDate(disruptionRepeatsEndDate).day();

        const diffInDaysWithEndingOn =
            startDateDay < endingOnDateDay ? endingOnDateDay - startDateDay : endingOnDateDay - startDateDay + 7;

        const diffInDaysWithEndDate =
            startDateDay < endDateDay ? endDateDay - startDateDay : endDateDay - startDateDay + 7;

        if (
            disruptionEndDate !== disruptionStartDate &&
            (diffInDaysWithEndingOn <= diffInDaysWithEndDate || startDateDay === endingOnDateDay)
        ) {
            return disruptionRepeatsEndDate;
        } else {
            const diffInDays =
                endDateDay < endingOnDateDay ? endingOnDateDay - endDateDay : endingOnDateDay - endDateDay + 7;

            return convertDateTimeToFormat(
                getFormattedDate(disruptionRepeatsEndDate).subtract(diffInDays, "day").toDate(),
                CD_DATE_FORMAT,
            );
        }
    }

    return disruptionRepeatsEndDate || "";
};

export const filterDatePeriodMatchesDisruptionDatePeriod = (
    filterStartDate: dayjs.Dayjs,
    filterEndDate: dayjs.Dayjs,
    disruptionStartDate: dayjs.Dayjs,
    disruptionEndDate: dayjs.Dayjs | undefined,
): boolean => {
    if (disruptionEndDate) {
        return (
            disruptionStartDate.isBetween(filterStartDate, filterEndDate) ||
            disruptionEndDate.isBetween(filterStartDate, filterEndDate)
        );
    }

    return disruptionStartDate.isBetween(filterStartDate, filterEndDate);
};
