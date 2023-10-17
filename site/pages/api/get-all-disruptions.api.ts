import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Progress, PublishStatus, Severity } from "@create-disruptions-data/shared-ts/enums";
import { getSortedDisruptionFinalEndDate, sortDisruptionsByStartDate } from "@create-disruptions-data/shared-ts/utils";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { VEHICLE_MODES } from "../../constants";
import { getDisruptionsDataFromDynamo } from "../../data/dynamo";
import { getDisplayByValue, mapValidityPeriods, reduceStringWithEllipsis } from "../../utils";
import { getSession } from "../../utils/apiUtils/auth";
import { isLiveDisruption } from "../../utils/dates";

export interface GetDisruptionsApiRequest extends NextApiRequest {
    body: {
        orgId: string;
        start: number;
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
    const disruptionEndDate = getSortedDisruptionFinalEndDate(disruption);

    if (!!disruptionEndDate && !disruption.template) {
        return isClosingOrClosed(disruptionEndDate, today);
    }

    return Progress.open;
};

export const isClosingOrClosed = (endDate: Dayjs, today: Dayjs): Progress => {
    if (endDate.isBefore(today)) {
        return Progress.closed;
    } else if (endDate.diff(today, "hour") < 24) {
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

export const formatSortedDisruption = (disruption: Disruption) => {
    const modes: string[] = [];
    const severitys: Severity[] = [];
    const serviceIds: string[] = [];
    const disruptionOperators: string[] = [];
    const atcoCodeSet = new Set<string>();

    let isOperatorWideCq = false;
    let isNetworkWideCq = false;
    let stopsAffectedCount = 0;

    const isLive = disruption.validity ? isLiveDisruption(disruption.validity) : false;

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
                        serviceIds.push(service.id.toString());
                    });

                    consequence.stops?.map((stop) => {
                        if (!atcoCodeSet.has(stop.atcoCode)) {
                            atcoCodeSet.add(stop.atcoCode);
                            stopsAffectedCount++;
                        }
                    });
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
        serviceIds,
        operators: disruptionOperators,
        id: disruption.disruptionId,
        summary: reduceStringWithEllipsis(disruption.summary, 95),
        validityPeriods: mapValidityPeriods(disruption),
        isOperatorWideCq: isOperatorWideCq,
        isNetworkWideCq: isNetworkWideCq,
        isLive: isLive,
        stopsAffectedCount: stopsAffectedCount,
    };
};

const getAllDisruptions = async (req: GetDisruptionsApiRequest, res: NextApiResponse) => {
    const session = getSession(req);

    const { template } = req.query;

    if (!session) {
        res.status(403);
        return;
    }

    const { orgId } = session;

    let disruptionsData = await getDisruptionsDataFromDynamo(orgId, template === "true");

    if (disruptionsData) {
        disruptionsData = disruptionsData.filter(
            (item) =>
                item.publishStatus === PublishStatus.published ||
                item.publishStatus === PublishStatus.draft ||
                item.publishStatus === PublishStatus.pendingApproval ||
                item.publishStatus === PublishStatus.editPendingApproval ||
                item.publishStatus === PublishStatus.rejected ||
                !item.template,
        );
        const sortedDisruptions = sortDisruptionsByStartDate(disruptionsData);

        const shortenedData = sortedDisruptions.map(formatSortedDisruption);

        res.status(200).json(shortenedData);
    } else {
        res.status(200).json({});
    }
};

export default getAllDisruptions;
