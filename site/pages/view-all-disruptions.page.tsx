import { Progress, PublishStatus, Severity } from "@create-disruptions-data/shared-ts/enums";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import { NextPageContext } from "next";
import { ReactElement } from "react";
import { randomUUID } from "crypto";
import { BaseLayout } from "../components/layout/Layout";
import ViewAllContents, { ViewAllContentProps } from "../components/ViewAllContents";
import { getSortedDisruptionFinalEndDate, SortedDisruption } from "../utils";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";

const title = "View All Disruptions";
const description = "View All Disruptions page for the Create Transport Disruptions Service";

export const getDisruptionStatus = (disruption: SortedDisruption): Progress => {
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

    if (!disruption.validity) {
        return Progress.closed;
    }

    const today = getDate();
    const disruptionEndDate = getSortedDisruptionFinalEndDate(disruption);

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

const ViewAllDisruptions = ({ newContentId, adminAreaCodes, filterStatus }: ViewAllContentProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <ViewAllContents newContentId={newContentId} adminAreaCodes={adminAreaCodes} filterStatus={filterStatus} />
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ViewAllContentProps }> => {
    const baseProps = {
        props: {
            newContentId: randomUUID(),
            adminAreaCodes: [],
            orgId: "",
        },
    };

    if (!ctx.req) {
        return baseProps;
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        return baseProps;
    }

    const showPending = ctx.query.pending?.toString() === "true";
    const showDraft = ctx.query.draft?.toString() === "true";

    return {
        props: {
            adminAreaCodes: session.adminAreaCodes,
            newContentId: randomUUID(),
            ...(showPending
                ? { filterStatus: Progress.pendingApproval }
                : showDraft
                ? { filterStatus: Progress.draft }
                : {}),
        },
    };
};

export default ViewAllDisruptions;
