import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { notEmpty, sortDisruptionsByStartDate } from "@create-disruptions-data/shared-ts/utils";
import { makeFilteredArraySchema } from "@create-disruptions-data/shared-ts/utils/zod";
import { NextApiRequest, NextApiResponse } from "next";
import { ORG_DISRUPTIONS_BUCKET_NAME } from "../../../constants";
import { getDisruptionsDataFromDynamo } from "../../../data/dynamo";
import { getObject } from "../../../data/s3";
import { FullDisruption, fullDisruptionSchema } from "../../../schemas/disruption.schema";
import { formatSortedDisruption } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";
import logger from "../../../utils/logger";

export interface GetDisruptionsApiRequest extends NextApiRequest {
    body: {
        orgId: string;
        start: number;
    };
}

export const getDashboardDisruptions = async (orgId: string, isTemplate: boolean) => {
    let disruptions: FullDisruption[] = [];

    try {
        if (isTemplate) {
            disruptions = await getDisruptionsDataFromDynamo(orgId, true);
        } else {
            const s3Disruptions = await getObject(ORG_DISRUPTIONS_BUCKET_NAME, `${orgId}/disruptions.json`);

            if (!s3Disruptions) {
                return [];
            }

            disruptions = makeFilteredArraySchema(fullDisruptionSchema).parse(JSON.parse(s3Disruptions.toString()));
        }

        const filteredDisruptions = disruptions
            .filter(
                (item, index, self) =>
                    item &&
                    (item.publishStatus === PublishStatus.published ||
                        item.publishStatus === PublishStatus.draft ||
                        item.publishStatus === PublishStatus.pendingApproval ||
                        item.publishStatus === PublishStatus.editPendingApproval ||
                        item.publishStatus === PublishStatus.rejected ||
                        !item.template) &&
                    index === self.findIndex((t) => t?.disruptionId === item.disruptionId),
            )
            .filter(notEmpty);

        const sortedDisruptions = sortDisruptionsByStartDate(filteredDisruptions);
        return sortedDisruptions.map(formatSortedDisruption);
    } catch (e) {
        throw e;
    }
};

const getAllDisruptions = async (req: GetDisruptionsApiRequest, res: NextApiResponse) => {
    const session = getSession(req);

    const { template } = req.query;

    if (!session || (session.isOperatorUser && template)) {
        res.status(403);
        return;
    }

    const { orgId: sessionOrgId } = session;

    const reqOrgId = req.query.organisationId;

    if (reqOrgId !== sessionOrgId) {
        res.status(403).json({});
        return;
    }

    try {
        const disruptions = await getDashboardDisruptions(reqOrgId, template === "true");

        res.status(200).json({ disruptions });
    } catch (e) {
        logger.warn(`Error parsing disruptions for org: ${reqOrgId}`);
        res.status(500).json({ message: "Error retrieving disruptions" });
    }
};

export default getAllDisruptions;
