/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dayjs } from "dayjs";
import * as logger from "lambda-log";
import { History } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { getDate, getDatetimeFromDateAndTime, getFormattedDate, sortEarliestDate } from "./dates";
import { getParameter } from "./ssm";
import { Disruption, Validity } from "../disruptionTypes";
import { Roadwork } from "../roadwork.zod";

export const notEmpty = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

export const chunkArray = <T>(array: T[], chunkSize: number) => {
    const chunkArray = [];

    for (let i = 0; i < array.length; i += chunkSize) {
        chunkArray.push(array.slice(i, i + chunkSize));
    }

    return chunkArray;
};

export const getApiValidityPeriods = (validityPeriods: Validity[]) =>
    validityPeriods.map(({ disruptionNoEndDateTime, ...validity }) => ({
        ...validity,
        disruptionRepeats: validity.disruptionRepeats !== "doesntRepeat" ? validity.disruptionRepeats : undefined,
        disruptionRepeatsEndDate: validity.disruptionRepeatsEndDate || undefined,
    }));

export const getApiDisruptions = (disruptions: (Disruption & { organisation: { id: string; name: string } })[]) =>
    sortDisruptionsByStartDate(disruptions).map(
        ({
            template,
            orgId,
            publishStatus,
            consequences,
            validity,
            disruptionStartDate,
            disruptionStartTime,
            disruptionEndDate,
            disruptionRepeats,
            disruptionRepeatsEndDate,
            disruptionEndTime,
            disruptionNoEndDateTime,
            ...disruption
        }) => ({
            ...disruption,
            associatedLink: disruption.associatedLink || undefined,
            validity: getApiValidityPeriods([...(validity ?? [])]),
            consequences:
                consequences?.map(({ disruptionId, consequenceIndex, ...consequence }) => ({
                    ...consequence,
                    disruptionDelay: consequence.disruptionDelay || undefined,
                })) ?? [],
        }),
    );

export type ApiDisruption = Awaited<ReturnType<typeof getApiDisruptions>>[0];
export type ApiConsequence = ApiDisruption["consequences"][0];

export const sortDisruptionsByStartDate = (disruptions: Disruption[]): Disruption[] => {
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

export const getSortedDisruptionFinalEndDate = (disruption: Disruption | ApiDisruption): Dayjs | null => {
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

export type Logger = {
    info: (message: string) => void;
    error: (message: string | Error) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
};

export const getDisruptionCreationTime = (disruptionHistory: History[] | null, creationTime: string | null): string => {
    const currentTime = getDate().toISOString();
    if (creationTime) {
        return creationTime;
    } else if (disruptionHistory && disruptionHistory.length > 0) {
        return (
            disruptionHistory.find((h) => !!h.historyItems.find((item) => item === "Disruption created and published"))
                ?.datetime ?? currentTime
        );
    } else {
        return currentTime;
    }
};

export const getNextdoorClientIdAndSecret = async () => {
    const [nextdoorClientIdKeyParam, nextdoorClientSecretParam] = await Promise.all([
        getParameter("/social/nextdoor/client_id", logger),
        getParameter("/social/nextdoor/client_secret", logger),
    ]);

    const nextdoorClientId = nextdoorClientIdKeyParam.Parameter?.Value ?? "";
    const nextdoorClientSecret = nextdoorClientSecretParam.Parameter?.Value ?? "";

    return { nextdoorClientId, nextdoorClientSecret };
};

export const getNextdoorAuthHeader = async () => {
    const { nextdoorClientId, nextdoorClientSecret } = await getNextdoorClientIdAndSecret();
    if (!nextdoorClientId || !nextdoorClientSecret) {
        return "";
    }
    const key = `${nextdoorClientId}:${nextdoorClientSecret}`;

    return `Basic ${Buffer.from(key).toString("base64")}`;
};
export const getLiveRoadworks = (roadworks: Roadwork[]) =>
    roadworks
        .filter((roadwork) => roadwork.workStatus === "Works in progress" && !roadwork.actualEndDateTime)
        .sort((a, b) => {
            return sortEarliestDate(getDate(a.actualStartDateTime ?? ""), getDate(b.actualStartDateTime ?? ""));
        });
