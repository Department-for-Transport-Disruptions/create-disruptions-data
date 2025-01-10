import dayjs, { Dayjs } from "dayjs";
export declare const getDate: (input?: string) => dayjs.Dayjs;
export declare const getDatetimeFromDateAndTime: (date: string, time: string) => dayjs.Dayjs;
export declare const getFormattedDate: (date: string | Date) => dayjs.Dayjs;
export declare const checkOverlap: (firstStartDate: dayjs.Dayjs, firstEndDate: dayjs.Dayjs, secondStartDate: dayjs.Dayjs, secondEndDate: dayjs.Dayjs) => boolean;
export declare const isCurrentOrUpcomingDisruption: (publishEndDate: string | undefined, publishEndTime: string | undefined) => boolean;
export declare const convertDateTimeToFormat: (dateOrTime: string | Date, format?: string) => string;
export declare const sortEarliestDate: (firstDate: Dayjs, secondDate: Dayjs) => 1 | -1;
