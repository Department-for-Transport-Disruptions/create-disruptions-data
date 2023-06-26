import { Modes } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, useState } from "react";
import Table from "../components/form/Table";
import { TwoThirdsLayout } from "../components/layout/Layout";
import { ModeType } from "../schemas/organisation.schema";
import { SessionWithOrgDetail } from "../schemas/session.schema";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";

const title = "Account settings - Create Transport Disruption Data Service";
const description = "Account settings page for the Create Transport Disruption Data Service";

interface AccountSettingsProps {
    sessionWithOrg: SessionWithOrgDetail;
    csrfToken?: string;
}

const AccountSettings = ({ sessionWithOrg, csrfToken }: AccountSettingsProps): ReactElement => {
    const [mode, setMode] = useState<ModeType>(sessionWithOrg.mode as ModeType);

    const updateOrg = async (key: string, value: Modes) => {
        const previousValue = mode[key as keyof ModeType];
        setMode({ ...mode, [key]: value });
        const url = new URL("/api/admin/update-org", window.location.origin);
        csrfToken ? url.searchParams.append("_csrf", csrfToken) : null;
        const res = await fetch(url.toString(), {
            method: "POST",
            headers: csrfToken
                ? {
                      "Content-Type": "application/json",
                      "X-CSRF-TOKEN": csrfToken,
                  }
                : { "Content-Type": "application/json" },
            body: JSON.stringify({ ...sessionWithOrg, PK: sessionWithOrg.orgId, mode: { ...mode, [key]: value } }),
        });

        !res.ok ? setMode({ ...mode, [key]: previousValue }) : null;
    };

    return (
        <TwoThirdsLayout title={title} description={description}>
            <div className="govuk-form-group">
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
                        { header: "NaPTAN Adminarea", cells: [sessionWithOrg?.adminAreaCodes.join(", "), ""] },
                    ]}
                />
                {sessionWithOrg.isOrgAdmin ? (
                    <>
                        <h2 className="govuk-heading-m">From which source shall we acquire your data</h2>
                        <Table
                            rows={Object.keys(mode).map((key) => ({
                                header: `${key.charAt(0).toUpperCase()}${key.slice(1, key.length)}`,
                                cells: [radioButtons(key, mode[key as keyof ModeType])],
                            }))}
                        />
                    </>
                ) : null}
            </div>
        </TwoThirdsLayout>
    );

    function radioButtons(name: string, inputValue: string) {
        return (
            <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                <div className="govuk-radios__item">
                    <input
                        className="govuk-radios__input"
                        id={`${name}-tnds`}
                        name={`${name}-group`}
                        type="radio"
                        value="tnds"
                        checked={inputValue === "tnds"}
                        onChange={async () => {
                            await updateOrg(name, Modes.tnds);
                        }}
                    />
                    <label key={`${name}-tnds`} htmlFor={`${name}-tnds`} className="govuk-label govuk-radios__label">
                        TNDS
                    </label>
                </div>
                <div className="govuk-radios__item">
                    <input
                        className="govuk-radios__input"
                        id={`${name}-bods`}
                        name={`${name}-group`}
                        type="radio"
                        value="bods"
                        checked={inputValue === "bods"}
                        onChange={async () => {
                            await updateOrg(name, Modes.bods);
                        }}
                    />
                    <label key={`${name}-bods`} htmlFor={`${name}-bods`} className="govuk-label govuk-radios__label">
                        BODS
                    </label>
                </div>
            </div>
        );
    }
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: AccountSettingsProps }> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const sessionWithOrg = await getSessionWithOrgDetail(ctx.req);
    if (!sessionWithOrg) {
        throw new Error("No session found");
    }

    return {
        props: {
            sessionWithOrg,
        },
    };
};

export default AccountSettings;
