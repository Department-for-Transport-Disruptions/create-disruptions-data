import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Datasource, Progress, PublishStatus, Severity } from "@create-disruptions-data/shared-ts/enums";
import { getDate, getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import {
    getFutureDisruptions,
    getLiveDisruptions,
    getPastDisruptions,
} from "@create-disruptions-data/shared-ts/utils/db";
import { Dayjs } from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { VEHICLE_MODES } from "../../../constants";
import { getDisruptionsData } from "../../../data/db";
import { TableDisruption } from "../../../schemas/disruption.schema";
import { filterDisruptionsForOperatorUser, getDisplayByValue, reduceStringWithEllipsis } from "../../../utils";
import { getSession } from "../../../utils/apiUtils/auth";
import { isLiveDisruption } from "../../../utils/dates";

export interface GetDisruptionsApiRequest extends NextApiRequest {
    query: {
        organisationId: string;
        template: "true" | "false";
        request: "all" | "live" | "upcoming" | "recentlyClosed";
    };
}

export const getDisruptionStatus = (disruption: Disruption): Progress => {
    if (disruption.publishStatus === PublishStatus.draft) {
        return Progress.draft;
    }

    if (disruption.publishStatus === PublishStatus.rejected) {
        return Progress.rejected;
    }

    if (disruption.publishStatus === PublishStatus.pendingApproval) {
        return Progress.draftPendingApproval;
    }

    if (
        disruption.publishStatus === PublishStatus.editPendingApproval ||
        disruption.publishStatus === PublishStatus.pendingAndEditing
    ) {
        return Progress.editPendingApproval;
    }

    if (!disruption.validity && !disruption.template) {
        return Progress.closed;
    }

    const today = getDate();

    if (disruption.validityEndTimestamp && !disruption.template) {
        return isClosingOrClosed(getDate(disruption.validityEndTimestamp), today);
    }

    return Progress.open;
};

export const isClosingOrClosed = (endDate: Dayjs, today: Dayjs): Progress => {
    if (endDate.isBefore(today)) {
        return Progress.closed;
    }
    if (endDate.diff(today, "hour") < 24) {
        return Progress.closing;
    }

    return Progress.open;
};

export const getWorstSeverity = (severitys: Severity[]): Severity => {
    const severityScoringMap: { [key in Severity]: number } = {
        unknown: 0,
        verySlight: 1,
        slight: 2,
        normal: 3,
        severe: 4,
        verySevere: 5,
    };

    let worstSeverity: Severity = Severity.unknown;

    severitys.forEach((severity) => {
        if (!worstSeverity) {
            worstSeverity = severity;
        } else if (severityScoringMap[worstSeverity] < severityScoringMap[severity]) {
            worstSeverity = severity;
        }
    });

    return worstSeverity;
};

export const formatSortedDisruption = (disruption: Disruption): TableDisruption => {
    const modes: string[] = [];
    const severitys: Severity[] = [];
    const services: TableDisruption["services"] = [];
    const disruptionOperators: string[] = [];
    const atcoCodeSet = new Set<string>();

    let isOperatorWideCq = false;
    let isNetworkWideCq = false;
    let stopsAffectedCount = 0;
    let servicesAffectedCount = 0;

    const isLive = disruption.validity ? isLiveDisruption(disruption) : false;

    let dataSource: Datasource | undefined = undefined;

    if (disruption.consequences) {
        disruption.consequences.forEach((consequence) => {
            const modeToAdd = getDisplayByValue(VEHICLE_MODES, consequence.vehicleMode);
            if (!!modeToAdd && !modes.includes(modeToAdd)) {
                modes.push(modeToAdd);
            }

            severitys.push(consequence.disruptionSeverity);

            switch (consequence.consequenceType) {
                case "services":
                    consequence.services.forEach((service) => {
                        services.push({
                            nocCode: service.nocCode,
                            lineName: service.lineName,
                            ref: service.dataSource === Datasource.bods ? service.lineId : service.serviceCode,
                            dataSource: service.dataSource,
                        });
                        servicesAffectedCount++;
                    });

                    consequence.stops?.map((stop) => {
                        if (!atcoCodeSet.has(stop.atcoCode)) {
                            atcoCodeSet.add(stop.atcoCode);
                            stopsAffectedCount++;
                        }
                    });

                    dataSource = consequence.services[0].dataSource;

                    break;

                case "operatorWide":
                    isOperatorWideCq = true;
                    consequence.consequenceOperators.forEach((op) => {
                        disruptionOperators.push(op.operatorNoc);
                    });
                    break;

                case "networkWide":
                    isNetworkWideCq = true;
                    break;

                case "stops":
                    consequence.stops?.map((stop) => {
                        if (!atcoCodeSet.has(stop.atcoCode)) {
                            atcoCodeSet.add(stop.atcoCode);
                            stopsAffectedCount++;
                        }
                    });
                    break;
            }
        });
    }

    const status = getDisruptionStatus(disruption);

    return {
        displayId: disruption.displayId,
        modes,
        consequenceLength: disruption.consequences ? disruption.consequences.length : 0,
        status,
        severity: getWorstSeverity(severitys),
        services,
        dataSource,
        operators: disruptionOperators,
        id: disruption.id,
        summary: reduceStringWithEllipsis(disruption.summary, 95),
        validityStartTimestamp: disruption.validityStartTimestamp,
        validityEndTimestamp: disruption.validityEndTimestamp ?? null,
        publishStartDate: getDatetimeFromDateAndTime(
            disruption.publishStartDate,
            disruption.publishStartTime,
        ).toISOString(),
        publishEndDate:
            disruption.publishEndDate && disruption.publishEndTime
                ? getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime).toISOString()
                : "",
        isOperatorWideCq: isOperatorWideCq,
        isNetworkWideCq: isNetworkWideCq,
        isLive: isLive,
        stopsAffectedCount: stopsAffectedCount,
        servicesAffectedCount,
        disruptionType: disruption.disruptionType,
        description: disruption.description,
        disruptionReason: disruption.disruptionReason,
        creationTime: disruption.creationTime,
        history: disruption.history,
    };
};

const getAllDisruptions = async (req: GetDisruptionsApiRequest, res: NextApiResponse) => {
    const session = getSession(req);

    const { template, organisationId: reqOrgId, request } = req.query;

    if (!session || (session.isOperatorUser && template)) {
        res.status(403);
        return;
    }

    const { orgId: sessionOrgId } = session;

    if (reqOrgId !== sessionOrgId) {
        res.status(403).json({});
        return;
    }

    let disruptions: Disruption[] = [];

    switch (request) {
        case "all":
            disruptions = await getDisruptionsData(sessionOrgId, template === "true");
            break;
        case "live":
            disruptions = await getLiveDisruptions(sessionOrgId);
            break;
        case "upcoming":
            disruptions = await getFutureDisruptions(sessionOrgId);
            break;
        case "recentlyClosed":
            disruptions = await getPastDisruptions(sessionOrgId);
            break;
        default:
            disruptions = [];
    }

    let disruptionsData = disruptions;

    if (session.isOperatorUser) {
        disruptionsData = filterDisruptionsForOperatorUser(disruptionsData, session.operatorOrgId);
    }

    if (disruptionsData) {
        const filteredDisruptions = disruptionsData.filter(
            (item) =>
                item.publishStatus === PublishStatus.published ||
                item.publishStatus === PublishStatus.draft ||
                item.publishStatus === PublishStatus.pendingApproval ||
                item.publishStatus === PublishStatus.editPendingApproval ||
                item.publishStatus === PublishStatus.rejected ||
                !item.template,
        );

        const shortenedData = filteredDisruptions.map(formatSortedDisruption);

        res.status(200).json({ disruptions: shortenedData });
    } else {
        res.status(200).json({});
    }
};

export default getAllDisruptions;
