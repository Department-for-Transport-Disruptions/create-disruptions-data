import { Disruption, DisruptionInfo, Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    getDate,
    getDatetimeFromDateAndTime,
    getFormattedDate,
    sortEarliestDate,
} from "@create-disruptions-data/shared-ts/utils/dates";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { notEmpty } from ".";
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

export const getDateForExporter = (date: string) => dayjs(date).format("DD/MM/YYYY");

export const formatTime = (time: string) => (time.length === 4 ? `${time.slice(0, -2)}:${time.slice(-2)}` : time);

export const isAtLeast5MinutesAfter = (date: dayjs.Dayjs) => {
    const currentDateTime = dayjs();
    const fiveMinutesAfterCurrent = currentDateTime.add(5, "minutes");
    return date.isSameOrAfter(fiveMinutesAfterCurrent);
};

export const getFutureDateAsString = (addDays: number, dateFormat = CD_DATE_FORMAT) => {
    return dayjs().add(addDays, "day").format(dateFormat).toString();
};

export const formatAndDefaultDateTime = (addMinutes = 10) => {
    return dayjs().add(addMinutes, "minutes").toISOString();
};

export const defaultDateTime = (addMinutes = 10) => {
    const datetime = dayjs().tz("Europe/London").add(addMinutes, "minutes");
    return { time: datetime.format("HHmm").toString(), date: datetime.format(CD_DATE_FORMAT).toString() };
};

export const calculateEndingDateForWeeklyRepeatingDisruption = (
    disruptionRepeatsEndDate: string,
    disruptionStartDate: string,
    disruptionEndDate: string,
) => {
    const startDateDay = getFormattedDate(disruptionStartDate).day();
    const endDateDay = getFormattedDate(disruptionEndDate).day();
    const endingOnDateDay = getFormattedDate(disruptionRepeatsEndDate).day();

    const diffInDaysWithEndingOn =
        startDateDay < endingOnDateDay ? endingOnDateDay - startDateDay : endingOnDateDay - startDateDay + 7;

    const diffInDaysWithEndDate = startDateDay < endDateDay ? endDateDay - startDateDay : endDateDay - startDateDay + 7;

    if (
        disruptionEndDate !== disruptionStartDate &&
        (diffInDaysWithEndingOn <= diffInDaysWithEndDate || startDateDay === endingOnDateDay)
    ) {
        return getFormattedDate(disruptionRepeatsEndDate);
    }

    const diffInDays = endDateDay < endingOnDateDay ? endingOnDateDay - endDateDay : endingOnDateDay - endDateDay + 7;

    return getFormattedDate(disruptionRepeatsEndDate).subtract(diffInDays, "day");
};

export const getEndingOnDateText = (
    disruptionRepeats?: string,
    disruptionRepeatsEndDate?: string,
    disruptionStartDate?: string,
    disruptionEndDate?: string,
) => {
    if (disruptionRepeats === "weekly" && disruptionStartDate && disruptionRepeatsEndDate && disruptionEndDate) {
        const endingDate = calculateEndingDateForWeeklyRepeatingDisruption(
            disruptionRepeatsEndDate,
            disruptionStartDate,
            disruptionEndDate,
        );

        return convertDateTimeToFormat(endingDate.toDate(), CD_DATE_FORMAT);
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

export const isLiveDisruption = (disruption: Disruption) => {
    const today = getDate();

    return (
        (getDate(disruption.validityStartTimestamp)?.isSameOrBefore(today) &&
            ((disruption.validityEndTimestamp && getDate(disruption.validityEndTimestamp)?.isSameOrAfter(today)) ||
                !disruption.validityEndTimestamp)) ||
        false
    );
};

export const isUpcomingDisruption = (validityPeriods: Validity[], today: Dayjs) => {
    const startTime = getDatetimeFromDateAndTime(
        validityPeriods[0].disruptionStartDate,
        validityPeriods[0].disruptionStartTime,
    );
    return startTime.isAfter(today);
};

export const getValidityAndPublishStartAndEndDates = (disruption: DisruptionInfo) => {
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

    const validityStartAndEndDates = validityPeriods
        .map((v) => {
            if (!v.disruptionRepeats || v.disruptionRepeats === "doesntRepeat") {
                return {
                    startTimestamp: getDatetimeFromDateAndTime(v.disruptionStartDate, v.disruptionStartTime),
                    endTimestamp:
                        v.disruptionEndDate && v.disruptionEndTime
                            ? getDatetimeFromDateAndTime(v.disruptionEndDate, v.disruptionEndTime)
                            : null,
                };
            }

            if (!v.disruptionRepeats || !v.disruptionRepeatsEndDate || !v.disruptionEndDate || !v.disruptionEndTime) {
                return null;
            }

            let endDate = v.disruptionRepeatsEndDate;

            if (v.disruptionRepeats === "weekly" && v.disruptionRepeatsEndDate && v.disruptionEndDate) {
                endDate = calculateEndingDateForWeeklyRepeatingDisruption(
                    v.disruptionRepeatsEndDate,
                    v.disruptionStartDate,
                    v.disruptionEndDate,
                ).format(CD_DATE_FORMAT);
            }

            return {
                startTimestamp: getDatetimeFromDateAndTime(v.disruptionStartDate, v.disruptionStartTime),
                endTimestamp: getDatetimeFromDateAndTime(endDate, v.disruptionEndTime),
            };
        })
        .filter(notEmpty);

    const sortedValidityPeriods = validityStartAndEndDates.sort((a, b) => {
        return sortEarliestDate(a.startTimestamp, b.startTimestamp);
    });

    return {
        validityStartTimestamp: sortedValidityPeriods[0].startTimestamp,
        validityEndTimestamp: sortedValidityPeriods.at(-1)?.endTimestamp ?? null,
        publishStartTimestamp: getDatetimeFromDateAndTime(disruption.publishStartDate, disruption.publishStartTime),
        publishEndTimestamp:
            disruption.publishEndDate && disruption.publishEndTime
                ? getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime)
                : null,
    };
};
