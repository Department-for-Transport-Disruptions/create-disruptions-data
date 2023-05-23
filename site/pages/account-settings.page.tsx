import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement } from "react";
import Table from "../components/form/Table";
import { TwoThirdsLayout } from "../components/layout/Layout";
import { getOrganisationInfoById } from "../data/dynamo";
import { Organisation } from "../schemas/organisation.schema";
import { SessionWithOrgDetail } from "../schemas/session.schema";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";

const title = "Account settings - Create Transport Disruption Data Service";
const description = "Account settings page for the Create Transport Disruption Data Service";

interface AccountSettingsProps {
    sessionWithOrg: SessionWithOrgDetail;
    orgInfo: Organisation | null;
}

const AccountSettings = ({ sessionWithOrg, orgInfo }: AccountSettingsProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <div>
            <h1 className="govuk-heading-l">My account</h1>
            <h2 className="govuk-heading-m">Account settings</h2>
            <Table
                rows={[
                    { header: "Email address", cells: [sessionWithOrg.email, ""] },
                    {
                        header: "Password",
                        cells: [
                            <input
                                className="bg-white"
                                disabled={true}
                                key="password"
                                type="password"
                                id="password"
                                name="password"
                                value={"myPassword"}
                            />,
                            <Link key={"change-password"} className="govuk-link" href={"/change-password"}>
                                Change
                            </Link>,
                        ],
                    },
                    { header: "Organisation", cells: [sessionWithOrg.orgName, ""] },
                    { header: "Admin area", cells: [orgInfo?.adminAreaCodes.join(", "), ""] },
                ]}
            />
        </div>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: AccountSettingsProps }> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const sessionWithOrg = await getSessionWithOrgDetail(ctx.req);

    let orgInfo: Organisation | null = null;

    if (sessionWithOrg?.orgId) orgInfo = await getOrganisationInfoById(sessionWithOrg?.orgId);

    if (!sessionWithOrg) {
        throw new Error("No session found");
    }

    return {
        props: {
            sessionWithOrg,
            orgInfo,
        },
    };
};

export default AccountSettings;
