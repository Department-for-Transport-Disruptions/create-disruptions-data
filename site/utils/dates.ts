import { Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { getDate, getFormattedDate, getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import dayjs, { Dayjs } from "dayjs";
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

export const formatDate = (date: string, time: string) =>
    dayjs.tz(`${date} ${time}`, "DD/MM/YYYY HHmm", "Europe/London").utc().toISOString();

export const convertDateTimeToFormat = (dateOrTime: string | Date, format: string = CD_DATE_FORMAT) => {
    return dayjs(dateOrTime).tz("Europe/London").format(format);
};

export const getDateForExporter = (date: string) => dayjs(date).format("ddd DD MMM YY");

export const formatTime = (time: string) => (time.length === 4 ? time.slice(0, -2) + ":" + time.slice(-2) : time);

export const isAtLeast5MinutesAfter = (date: dayjs.Dayjs) => {
    const currentDateTime = dayjs();
    const fiveMinutesAfterCurrent = currentDateTime.add(5, "minutes");
    return date.isSameOrAfter(fiveMinutesAfterCurrent);
};

export const getFutureDateAsString = (addDays: number, dateFormat = CD_DATE_FORMAT) => {
    return dayjs().add(addDays, "day").format(dateFormat).toString();
};

export const formatAndDefaultDateTime = (addMinutes = 6) => {
    return dayjs().add(addMinutes, "minutes").toISOString();
};

export const defaultDateTime = (addMinutes = 6) => {
    const datetime = dayjs().tz("Europe/London").add(addMinutes, "minutes");
    return { time: datetime.format("HHmm").toString(), date: datetime.format(CD_DATE_FORMAT).toString() };
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
            disruptionStartDate.isBetween(filterStartDate, filterEndDate, "day", "[]") ||
            disruptionEndDate.isBetween(filterStartDate, filterEndDate, "day", "[]")
        );
    }

    return disruptionStartDate.isBetween(filterStartDate, filterEndDate, "day", "[]");
};

export const dateIsSameOrBeforeSecondDate = (firstDate: dayjs.Dayjs, secondDate: dayjs.Dayjs): boolean =>
    firstDate.isSameOrBefore(secondDate, "day");

export const getDaysInPast = (date: Dayjs | string) => getDate().diff(date, "days");

export const isLiveDisruption = (validityPeriods: Validity[]) => {
    const today = getDate();

    return validityPeriods.some((period) => {
        const startTime = getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime);

        return (
            startTime.isSameOrBefore(today) &&
            (!period.disruptionEndDate ||
                (!!period.disruptionEndDate &&
                    !!period.disruptionEndTime &&
                    getDatetimeFromDateAndTime(period.disruptionEndDate, period.disruptionEndTime).isSameOrAfter(
                        today,
                    )))
        );
    });
};

export const isUpcomingDisruption = (validityPeriods: Validity[], today: Dayjs) => {
    return validityPeriods.every((period) =>
        getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).isAfter(today),
    );
};
