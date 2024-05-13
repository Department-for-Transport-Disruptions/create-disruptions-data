import {
    Consequence,
    Disruption,
    OperatorConsequence,
    ServicesConsequence,
    StopsConsequence,
} from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import {
    notEmpty,
    getSortedDisruptionFinalEndDate,
    ApiConsequence,
    ApiDisruption,
} from "@create-disruptions-data/shared-ts/utils";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import { json2csv } from "json-2-csv";
import { z } from "zod";

const isOperatorConsequence = (c: unknown): c is OperatorConsequence =>
    (c as Consequence).consequenceType === "operatorWide";

const isServicesConsequence = (c: unknown): c is ServicesConsequence =>
    (c as Consequence).consequenceType === "services";

const isStopsConsequence = (c: unknown): c is StopsConsequence => (c as Consequence).consequenceType === "stops";

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

export const convertToCsv = async (disruptions: ApiDisruption[]) => {
    const csvDisruptions = disruptions.map((disruption) => {
        return {
            ...disruption,
            validityStart: getDatetimeFromDateAndTime(
                disruption.validity[0].disruptionStartDate,
                disruption.validity[0].disruptionStartTime,
            ).toISOString(),
            validityEnd: getSortedDisruptionFinalEndDate(disruption)?.toISOString() ?? "",
            publicationStart: getDatetimeFromDateAndTime(
                disruption.publishStartDate,
                disruption.publishStartTime,
            ).toISOString(),
            publicationEnd:
                disruption.publishEndDate && disruption.publishEndTime
                    ? getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime).toISOString()
                    : "",
            planned: disruption.disruptionType === "planned" ? "true" : "false",
            modesAffected: getAffectedModesList(disruption.consequences),
            operatorsAffected: getAffectedOperatorsList(disruption.consequences),
            servicesAffected: getAffectedServicesCount(disruption.consequences),
            stopsAffected: getAffectedStopsCount(disruption.consequences),
        };
    });

    return json2csv(csvDisruptions, {
        keys: [
            {
                field: "organisation.name",
                title: "Organisation",
            },
            {
                field: "disruptionId",
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

const adminAreaSchema = z.object({
    administrativeAreaCode: z.string(),
    name: z.string(),
    shortName: z.string(),
});

const API_BASE_URL = "https://api.test.ref-data.dft-create-data.com/v1";

export type AdminArea = z.infer<typeof adminAreaSchema>;

export const fetchAdminAreas = async () => {
    const searchApiUrl = `${API_BASE_URL}/admin-areas`;

    const res = await fetch(searchApiUrl, {
        method: "GET",
    });

    const parseResult = z.array(adminAreaSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return [];
    }

    return parseResult.data;
};
