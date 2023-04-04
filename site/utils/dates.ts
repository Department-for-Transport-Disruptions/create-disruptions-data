import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { CD_DATE_FORMAT } from "../constants";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

export const convertDateTimeToFormat = (dateOrTime: string | Date, format: string = CD_DATE_FORMAT) =>
    dayjs(dateOrTime).format(format);

export const getDate = (input?: string) => dayjs(!!input ? input : undefined);

export const getFormattedDate = (date: string | Date) => dayjs(date, "DD/MM/YYYY");

export const formatTime = (time: string) => (time.length === 4 ? time.slice(0, -2) + ":" + time.slice(-2) : time);

export const getDatetimeFromDateAndTime = (date: string, time: string) => dayjs(`${date} ${time}`, "DD/MM/YYYY HHmm");

export const getFutureDateAsString = (addDays: number, dateFormat = CD_DATE_FORMAT) => {
    return dayjs().add(addDays, "day").format(dateFormat).toString();
};
export const checkOverlap = (firstStartDate: dayjs.Dayjs, firstEndDate: dayjs.Dayjs, secondStartDate: dayjs.Dayjs) => {
    return (
        firstStartDate.isBetween(secondStartDate, firstEndDate) ||
        secondStartDate.isBetween(firstStartDate, firstEndDate) ||
        firstStartDate.isSame(secondStartDate)
    );
};
