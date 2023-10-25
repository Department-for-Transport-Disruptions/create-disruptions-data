import { Progress } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import { ReactElement } from "react";
import { randomUUID } from "crypto";
import { BaseLayout } from "../components/layout/Layout";
import ViewAllContents, { ViewAllTemplatesProps } from "../components/ViewAllTemplates";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";

const title = "Templates";
const description = "Templates page for the Create Transport Disruptions Service";

const ViewAllTemplates = ({
    newContentId,
    adminAreaCodes,
    filterStatus,
    enableLoadingSpinnerOnPageLoad = true,
}: ViewAllTemplatesProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <ViewAllContents
                newContentId={newContentId}
                adminAreaCodes={adminAreaCodes}
                filterStatus={filterStatus}
                enableLoadingSpinnerOnPageLoad={enableLoadingSpinnerOnPageLoad}
            />
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ViewAllTemplatesProps }> => {
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
export default ViewAllTemplates;
