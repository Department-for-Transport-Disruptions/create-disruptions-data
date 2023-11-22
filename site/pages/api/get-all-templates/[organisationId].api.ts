import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Progress, PublishStatus, Severity } from "@create-disruptions-data/shared-ts/enums";
import { getSortedDisruptionFinalEndDate, sortDisruptionsByStartDate } from "@create-disruptions-data/shared-ts/utils";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { VEHICLE_MODES } from "../../../constants";
import { getTemplatesDataFromDynamo } from "../../../data/dynamo";
import {
    filterDisruptionsForOperatorUser,
    getDisplayByValue,
    mapValidityPeriods,
    reduceStringWithEllipsis,
} from "../../../utils";
import { getSession } from "../../../utils/apiUtils/auth";
import { isLiveDisruption } from "../../../utils/dates";

export interface GetTemplatesApiRequest extends NextApiRequest {
    body: {
        orgId: string;
        start: number;
    };
}

export const getTemplateStatus = (template: Disruption): Progress => {
    if (template.publishStatus === PublishStatus.draft) {
        return Progress.draft;
    }

    if (template.publishStatus === PublishStatus.rejected) {
        return Progress.rejected;
    }

    if (template.publishStatus === PublishStatus.pendingApproval) {
        return Progress.draftPendingApproval;
    }

    if (
        template.publishStatus === PublishStatus.editPendingApproval ||
        template.publishStatus === PublishStatus.pendingAndEditing
    ) {
        return Progress.editPendingApproval;
    }

    if (!template.validity) {
        return Progress.closed;
    }

    const today = getDate();
    const disruptionEndDate = getSortedDisruptionFinalEndDate(template);

    if (!!disruptionEndDate) {
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

export const formatSortedDisruption = (template: Disruption) => {
    const modes: string[] = [];
    const severitys: Severity[] = [];
    const serviceIds: string[] = [];
    const templateOperators: string[] = [];
    const atcoCodeSet = new Set<string>();

    let isOperatorWideCq = false;
    let isNetworkWideCq = false;
    let stopsAffectedCount = 0;

    const getEndDateTime = getSortedDisruptionFinalEndDate(template);

    const isLive = template.validity ? isLiveDisruption(template.validity, getEndDateTime) : false;

    if (template.consequences) {
        template.consequences.forEach((consequence) => {
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
                        templateOperators.push(op.operatorNoc);
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

    const status = getTemplateStatus(template);

    return {
        displayId: template.displayId,
        modes,
        consequenceLength: template.consequences ? template.consequences.length : 0,
        status,
        severity: getWorstSeverity(severitys),
        serviceIds,
        operators: templateOperators,
        id: template.disruptionId,
        summary: reduceStringWithEllipsis(template.summary, 95),
        validityPeriods: mapValidityPeriods(template),
        isOperatorWideCq: isOperatorWideCq,
        isNetworkWideCq: isNetworkWideCq,
        isLive: isLive,
        stopsAffectedCount: stopsAffectedCount,
    };
};

const getAllTemplates = async (req: GetTemplatesApiRequest, res: NextApiResponse) => {
    const session = getSession(req);

    if (!session) {
        res.status(403);
        return;
    }

    const { orgId: sessionOrgId } = session;

    const reqOrgId = req.query.organisationId;

    if (reqOrgId !== sessionOrgId) {
        res.status(403).json({});
        return;
    }

    const nextKeyParsed = z
        .object({ PK: z.string(), SK: z.string() })
        .safeParse(req.query.nextKey ? JSON.parse(decodeURIComponent(req.query.nextKey.toString())) : undefined);

    let nextKey: Record<string, unknown> | undefined = undefined;

    if (nextKeyParsed.success) {
        nextKey = nextKeyParsed.data;
    }

    const { disruptions, nextKey: newNextKey } = await getTemplatesDataFromDynamo(sessionOrgId, nextKey);

    let templateData = disruptions;

    if (session.isOperatorUser) {
        templateData = filterDisruptionsForOperatorUser(templateData, session.operatorOrgId);
    }

    if (templateData) {
        const filteredDisruptions = templateData.filter(
            (item) =>
                item.publishStatus === PublishStatus.published ||
                item.publishStatus === PublishStatus.draft ||
                item.publishStatus === PublishStatus.pendingApproval ||
                item.publishStatus === PublishStatus.editPendingApproval ||
                item.publishStatus === PublishStatus.rejected,
        );
        const sortedDisruptions = sortDisruptionsByStartDate(filteredDisruptions);

        const shortenedData = sortedDisruptions.map(formatSortedDisruption);

        res.status(200).json({ disruptions: shortenedData, nextKey: newNextKey });
    } else {
        res.status(200).json({});
    }
};

export default getAllTemplates;
