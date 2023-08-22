/* eslint-disable import/no-named-as-default-member */
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export const getDate = (input?: string) => (input ? dayjs.tz(input, "Europe/London") : dayjs().tz("Europe/London"));

export const getDatetimeFromDateAndTime = (date: string, time: string) =>
    dayjs.tz(`${date} ${time}`, `DD/MM/YYYY ${time ? "HHmm" : ""}`, "Europe/London");

export const getFormattedDate = (date: string | Date) => dayjs(date, "DD/MM/YYYY");

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
