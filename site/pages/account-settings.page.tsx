import Link from "next/link";
import { ReactElement } from "react";
import Table from "../components/form/Table";
import { TwoThirdsLayout } from "../components/layout/Layout";

const title = "Account settings - Create Transport Disruption Data Service";
const description = "Account settings page for the Create Transport Disruption Data Service";

const AccountSettings = (): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <div>
            <h1 className="govuk-heading-l">My account</h1>
            <h2 className="govuk-heading-m">Account settings</h2>
            <Table
                rows={[
                    { header: "Email address", cells: ["user.name@bus.co.uk", ""] },
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
                    { header: "Organisation", cells: ["NEXUS", ""] },
                ]}
            />
        </div>
    </TwoThirdsLayout>
);

export default AccountSettings;
