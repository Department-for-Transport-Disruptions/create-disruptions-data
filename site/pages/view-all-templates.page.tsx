import { Progress } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext, Redirect } from "next";
import { ReactElement } from "react";
import { randomUUID } from "crypto";
import { BaseLayout } from "../components/layout/Layout";
import ViewAllTemplateContents, { ViewAllTemplatesProps } from "../components/ViewAllTemplates";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";

const title = "Templates";
const description = "Templates page for the Create Transport Disruptions Service";

const ViewAllTemplates = ({
    newContentId,
    adminAreaCodes,
    filterStatus,
    enableLoadingSpinnerOnPageLoad = true,
    orgId,
}: ViewAllTemplatesProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <ViewAllTemplateContents
                newContentId={newContentId}
                adminAreaCodes={adminAreaCodes}
                filterStatus={filterStatus}
                enableLoadingSpinnerOnPageLoad={enableLoadingSpinnerOnPageLoad}
                orgId={orgId}
            />
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: ViewAllTemplatesProps } | { redirect: Redirect }> => {
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

    if (session.isOperatorUser) {
        return {
            redirect: {
                destination: "/404",
                statusCode: 302,
            },
        };
    }

    const showPending = ctx.query.pending?.toString() === "true";
    const showDraft = ctx.query.draft?.toString() === "true";

    return {
        props: {
            adminAreaCodes: session.adminAreaCodes,
            orgId: session.orgId,
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
