import * as logger from "lambda-log";
import { getDate, getDatetimeFromDateAndTime, getFormattedDate, sortEarliestDate } from "./dates";
import { getParameter } from "./ssm";
export const notEmpty = (value) => {
    return value !== null && value !== undefined;
};
export const chunkArray = (array, chunkSize) => {
    const chunkArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunkArray.push(array.slice(i, i + chunkSize));
    }
    return chunkArray;
};
export const getApiValidityPeriods = (validityPeriods) => validityPeriods.map(({ disruptionNoEndDateTime, ...validity }) => ({
    ...validity,
    disruptionRepeats: validity.disruptionRepeats !== "doesntRepeat" ? validity.disruptionRepeats : undefined,
    disruptionRepeatsEndDate: validity.disruptionRepeatsEndDate || undefined,
}));
export const getApiDisruptions = (disruptions) => sortDisruptionsByStartDate(disruptions).map(({ template, orgId, publishStatus, consequences, validity, disruptionStartDate, disruptionStartTime, disruptionEndDate, disruptionRepeats, disruptionRepeatsEndDate, disruptionEndTime, disruptionNoEndDateTime, ...disruption }) => ({
    ...disruption,
    associatedLink: disruption.associatedLink || undefined,
    validity: getApiValidityPeriods([...(validity ?? [])]),
    consequences: consequences?.map(({ consequenceIndex, ...consequence }) => ({
        ...consequence,
        disruptionDelay: consequence.disruptionDelay || undefined,
    })) ?? [],
}));
export const sortDisruptionsByStartDate = (disruptions) => {
    const disruptionsWithSortedValidityPeriods = disruptions.map((disruption) => {
        const validityPeriods = [
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
            return sortEarliestDate(getDatetimeFromDateAndTime(a.disruptionStartDate, a.disruptionStartTime), getDatetimeFromDateAndTime(b.disruptionStartDate, b.disruptionStartTime));
        });
        return { ...disruption, validity: sortedValidityPeriods };
    });
    return disruptionsWithSortedValidityPeriods.sort((a, b) => {
        const aTime = getDatetimeFromDateAndTime(a.validity[0].disruptionStartDate, a.validity[0].disruptionStartTime);
        const bTime = getDatetimeFromDateAndTime(b.validity[0].disruptionStartDate, b.validity[0].disruptionStartTime);
        return sortEarliestDate(aTime, bTime);
    });
};
export const getSortedDisruptionFinalEndDate = (disruption) => {
    let disruptionEndDate = null;
    if (!disruption.validity) {
        throw new Error("Validity missing");
    }
    let noEndDatesFound = false;
    disruption.validity.forEach((validity) => {
        if (!noEndDatesFound) {
            const repeatsEndDate = (validity.disruptionRepeats === "daily" || validity.disruptionRepeats === "weekly") &&
                validity.disruptionRepeatsEndDate
                ? getFormattedDate(validity.disruptionRepeatsEndDate)
                : validity.disruptionEndDate && validity.disruptionEndTime
                    ? getDatetimeFromDateAndTime(validity.disruptionEndDate, validity.disruptionEndTime)
                    : null;
            if (repeatsEndDate && (repeatsEndDate.isAfter(disruptionEndDate) || disruptionEndDate === null)) {
                disruptionEndDate = repeatsEndDate;
            }
            else if (!repeatsEndDate) {
                disruptionEndDate = null;
                noEndDatesFound = true;
            }
        }
    });
    return disruptionEndDate;
};
export const filterActiveDisruptions = (disruptions) => {
    const sortedDisruptions = sortDisruptionsByStartDate(disruptions);
    const currentDatetime = getDate();
    return sortedDisruptions
        .filter((value, index, self) => index === self.findIndex((disruption) => disruption.id === value.id))
        .filter((disruption) => {
        const firstValidity = disruption.validity?.[0];
        const finalValidity = disruption.validity?.[disruption.validity.length - 1];
        if (!firstValidity || !finalValidity) {
            return false;
        }
        const startDatetime = getDatetimeFromDateAndTime(firstValidity.disruptionStartDate, firstValidity.disruptionStartTime);
        const endDatetime = finalValidity.disruptionEndDate && finalValidity.disruptionEndTime
            ? getDatetimeFromDateAndTime(finalValidity.disruptionEndDate, finalValidity.disruptionEndTime)
            : null;
        if (!endDatetime) {
            return currentDatetime.isAfter(startDatetime);
        }
        return currentDatetime.isBetween(startDatetime, endDatetime);
    });
};
export const getDisruptionCreationTime = (disruptionHistory, creationTime) => {
    const currentTime = getDate().toISOString();
    if (creationTime) {
        return creationTime;
    }
    if (disruptionHistory && disruptionHistory.length > 0) {
        return (disruptionHistory.find((h) => !!h.historyItems.find((item) => item === "Disruption created and published"))
            ?.datetime ?? currentTime);
    }
    return currentTime;
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
export const getLiveRoadworks = (roadworks) => roadworks
    .filter((roadwork) => roadwork.workStatus === "Works in progress" && !roadwork.actualEndDateTime)
    .sort((a, b) => {
    return sortEarliestDate(getDate(a.actualStartDateTime ?? ""), getDate(b.actualStartDateTime ?? ""));
});
export const transformToArray = (item) => (Array.isArray(item) ? item : [item]);
