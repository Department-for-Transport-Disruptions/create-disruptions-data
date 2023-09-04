import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement } from "react";
import { randomUUID } from "crypto";
import { BaseLayout } from "../components/layout/Layout";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";

const title = "View All Templates";
const description = "View All Templates page for the Create Transport Disruptions Service";

export interface ViewAllTemplatesProps {
    newDisruptionId: string;
    csrfToken?: string;
}

const ViewAllTemplates = ({ newDisruptionId }: ViewAllTemplatesProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">View all templates</h1>
            <div>
                <Link
                    href={`/create-disruption/${newDisruptionId}?template=true`}
                    role="button"
                    draggable="false"
                    className="govuk-button govuk-button--start"
                    data-module="govuk-button"
                    id="create-new-button"
                >
                    Create new template
                    <svg
                        className="govuk-button__start-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="17.5"
                        height="19"
                        viewBox="0 0 33 40"
                        role="presentation"
                        focusable="false"
                    >
                        <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
                    </svg>
                </Link>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ViewAllTemplatesProps }> => {
    const baseProps = {
        props: {
            newDisruptionId: randomUUID(),
        },
    };

    if (!ctx.req) {
        return baseProps;
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        return baseProps;
    }

    return {
        props: {
            newDisruptionId: randomUUID(),
        },
    };
};

export default ViewAllTemplates;
