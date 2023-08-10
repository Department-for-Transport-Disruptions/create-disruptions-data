import { PublishStatus, Severity } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { VEHICLE_MODES } from "../../constants";
import { getDisruptionsDataFromDynamo } from "../../data/dynamo";
import {
    SortedDisruption,
    getDisplayByValue,
    mapValidityPeriods,
    reduceStringWithEllipsis,
    sortDisruptionsByStartDate,
} from "../../utils";
import { getSession } from "../../utils/apiUtils/auth";
import { isLiveDisruption } from "../../utils/dates";
import { getDisruptionStatus, getWorstSeverity } from "../view-all-disruptions.page";

export interface GetDisruptionsApiRequest extends NextApiRequest {
    body: {
        orgId: string;
        start: number;
    };
}

export const formatSortedDisruption = (disruption: SortedDisruption) => {
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

            if (consequence.consequenceType === "services") {
                consequence.services.forEach((service) => {
                    serviceIds.push(service.id.toString());
                });

                consequence.stops?.map((stop) => {
                    if (!atcoCodeSet.has(stop.atcoCode)) {
                        atcoCodeSet.add(stop.atcoCode);
                        stopsAffectedCount++;
                    }
                });
            } else if (consequence.consequenceType === "operatorWide") {
                isOperatorWideCq = true;
                consequence.consequenceOperators.forEach((op) => {
                    disruptionOperators.push(op.operatorNoc);
                });
            } else if (consequence.consequenceType === "networkWide") {
                isNetworkWideCq = true;
            } else if (consequence.consequenceType === "stops") {
                consequence.stops?.map((stop) => {
                    if (!atcoCodeSet.has(stop.atcoCode)) {
                        atcoCodeSet.add(stop.atcoCode);
                        stopsAffectedCount++;
                    }
                });
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

    if (!session) {
        res.status(403);
        return;
    }

    const { orgId } = session;

    let disruptionsData = await getDisruptionsDataFromDynamo(orgId);

    if (disruptionsData) {
        disruptionsData = disruptionsData.filter(
            (item) =>
                item.publishStatus === PublishStatus.published ||
                item.publishStatus === PublishStatus.draft ||
                item.publishStatus === PublishStatus.pendingApproval ||
                item.publishStatus === PublishStatus.editPendingApproval ||
                item.publishStatus === PublishStatus.rejected,
        );
        const sortedDisruptions = sortDisruptionsByStartDate(disruptionsData);

        const shortenedData = sortedDisruptions.map(formatSortedDisruption);

        res.status(200).json(shortenedData);
    } else {
        res.status(200).json({});
    }
};

export default getAllDisruptions;
