import {
    Consequence,
    Disruption,
    JourneysConsequence,
    OperatorConsequence,
    ServicesConsequence,
    StopsConsequence,
} from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { ApiConsequence, ApiDisruption, notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import { json2csv } from "json-2-csv";

const isOperatorConsequence = (c: unknown): c is OperatorConsequence =>
    (c as Consequence).consequenceType === "operatorWide";

const isServicesConsequence = (c: unknown): c is ServicesConsequence =>
    (c as Consequence).consequenceType === "services";

const isStopsConsequence = (c: unknown): c is StopsConsequence => (c as Consequence).consequenceType === "stops";

const isJourneysConsequence = (c: unknown): c is JourneysConsequence =>
    (c as Consequence).consequenceType === "journeys";

export const getAffectedModesList = (consequences: ApiConsequence[]) =>
    consequences
        .map((c) => c.vehicleMode)
        .filter((item, index, array) => array.indexOf(item) === index)
        .join(";");

export const getAffectedOperatorsList = (consequences: ApiConsequence[]) =>
    consequences
        .flatMap((c) => {
            if (isOperatorConsequence(c)) {
                return c.consequenceOperators.flatMap((co) => co.operatorNoc);
            }

            return null;
        })
        .filter((item, index, array) => notEmpty(item) && array.indexOf(item) === index)
        .join(";");

export const getAffectedServicesCount = (consequences: ApiConsequence[]) =>
    consequences
        .flatMap((c) => {
            if (isServicesConsequence(c)) {
                return c.services;
            }

            return null;
        })
        .filter(
            (service, index, array) =>
                notEmpty(service) && array.findIndex((item) => item?.id === service.id) === index,
        ).length || "";

export const getAffectedStopsCount = (consequences: ApiConsequence[]) =>
    consequences
        .flatMap((c) => {
            if (isServicesConsequence(c) || isStopsConsequence(c)) {
                return c.stops;
            }

            return null;
        })
        .filter(
            (stop, index, array) =>
                notEmpty(stop) && array.findIndex((item) => item?.atcoCode === stop.atcoCode) === index,
        ).length || "";

export const getAffectedJourneysCount = (consequences: ApiConsequence[]) =>
    consequences
        .flatMap((c) => {
            if (isJourneysConsequence(c)) {
                return c.journeys;
            }

            return null;
        })
        .filter(
            (journey, index, array) =>
                notEmpty(journey) &&
                array.findIndex((item) => item?.vehicleJourneyCode === journey?.vehicleJourneyCode) === index,
        ).length || "";

export const convertToCsv = async (disruptions: ApiDisruption[], cancelFeatureFlag: boolean) => {
    const csvDisruptions = disruptions.map((disruption) => {
        return {
            ...disruption,
            validityStart: disruption.validityStartTimestamp,
            validityEnd: disruption.validityEndTimestamp ?? "",
            publicationStart: disruption.publishStartTimestamp,
            publicationEnd: disruption.publishEndTimestamp ?? "",
            planned: disruption.disruptionType === "planned" ? "true" : "false",
            modesAffected: getAffectedModesList(disruption.consequences),
            operatorsAffected: getAffectedOperatorsList(disruption.consequences),
            servicesAffected: getAffectedServicesCount(disruption.consequences),
            stopsAffected: getAffectedStopsCount(disruption.consequences),
            ...(cancelFeatureFlag ? { journeysAffected: getAffectedJourneysCount(disruption.consequences) } : {}),
        };
    });

    return json2csv(csvDisruptions, {
        keys: [
            {
                field: "organisation.name",
                title: "Organisation",
            },
            {
                field: "id",
                title: "ID",
            },
            {
                field: "validityStart",
                title: "Validity start",
            },
            {
                field: "validityEnd",
                title: "Validity end",
            },
            {
                field: "publicationStart",
                title: "Publication start",
            },
            {
                field: "publicationEnd",
                title: "Publication end",
            },
            {
                field: "disruptionReason",
                title: "Reason",
            },
            {
                field: "planned",
                title: "Planned",
            },
            {
                field: "modesAffected",
                title: "Modes affected",
            },
            {
                field: "operatorsAffected",
                title: "Operators affected",
            },
            {
                field: "servicesAffected",
                title: "Services affected",
            },
            {
                field: "stopsAffected",
                title: "Stops affected",
            },
            ...(cancelFeatureFlag
                ? [
                      {
                          field: "journeysAffected",
                          title: "Journeys affected",
                      },
                  ]
                : []),
        ],
    });
};

export const includeDisruption = (disruption: Disruption, currentDatetime: Dayjs) => {
    if (disruption.publishStatus !== PublishStatus.published) {
        return false;
    }

    if (disruption.publishEndDate && disruption.publishEndTime) {
        const endDatetime = getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime);

        if (currentDatetime.isAfter(endDatetime)) {
            return false;
        }
    }

    return true;
};

export const combineDateAndTime = (timestamp: string, newTime: string): string => {
    const date: Date = new Date(timestamp);
    const [hours, minutes, seconds]: number[] = newTime.split(":").map(Number);

    date.setUTCHours(hours, minutes, seconds, 0);

    return date.toISOString();
};
