import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, useState } from "react";
import ErrorSummary from "../components/form/ErrorSummary";
import FormElementWrapper, { FormGroupWrapper } from "../components/form/FormElementWrapper";
import Table from "../components/form/Table";
import { TwoThirdsLayout } from "../components/layout/Layout";
import { SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH } from "../constants";
import { ErrorInfo } from "../interfaces";
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
    const [mode, setMode] = useState<ModeType>(sessionWithOrg.mode);
    const [errors, setErrors] = useState<ErrorInfo[]>([]);
    const [emailNotificationPreference, setEmailNotificationPreference] = useState(false);

    const updateOrg = async (key: string, value: Datasource) => {
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
            body: JSON.stringify({
                adminAreaCodes: sessionWithOrg.adminAreaCodes,
                PK: sessionWithOrg.orgId,
                mode: { ...mode, [key]: value },
                name: sessionWithOrg.orgName,
            }),
        });

        if (!res.ok) {
            setMode({ ...mode, [key]: previousValue });
            setErrors([
                {
                    id: "modes",
                    errorMessage: "Retry selecting a different source later",
                },
                {
                    id: "header",
                    errorMessage: "Unable to update source selected",
                },
            ]);
        } else {
            setErrors([]);
        }
    };

    const updateEmailNotificationPreferences = async (emailPreference: boolean) => {
        setEmailNotificationPreference(emailPreference);
        const url = new URL("/api/admin/update-email-preference", window.location.origin);
        csrfToken ? url.searchParams.append("_csrf", csrfToken) : null;
        const res = await fetch(url.toString(), {
            method: "POST",
            headers: csrfToken
                ? {
                      "Content-Type": "application/json",
                      "X-CSRF-TOKEN": csrfToken,
                  }
                : { "Content-Type": "application/json" },
            body: JSON.stringify({
                userName: sessionWithOrg.username,
                emailNotificationsPreference: emailPreference ? "true" : "false",
            }),
        });
        if (res.ok) {
            console.log("failed!");
            setEmailNotificationPreference(!emailPreference);
            setErrors([
                {
                    id: "emailNotificationPreferences",
                    errorMessage: "Retry changing email preferences later",
                },
            ]);
        } else {
            setErrors([]);
        }
    };

    return (
        <TwoThirdsLayout title={title} description={description}>
            <div className="govuk-form-group">
                <h1 className="govuk-heading-l">Account settings</h1>
                <ErrorSummary errors={errors.filter((err) => err.id !== "modes")} />
                <Table
                    rows={
                        sessionWithOrg.isSystemAdmin
                            ? [
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
                                          <Link
                                              key={"change-password"}
                                              className="govuk-link"
                                              href={"/change-password"}
                                          >
                                              Change
                                          </Link>,
                                      ],
                                  },
                              ]
                            : [
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
                                          <Link
                                              key={"change-password"}
                                              className="govuk-link"
                                              href={"/change-password"}
                                          >
                                              Change
                                          </Link>,
                                      ],
                                  },
                                  { header: "Organisation", cells: [sessionWithOrg.orgName, ""] },
                                  {
                                      header: "NaPTAN Adminarea",
                                      cells: [sessionWithOrg?.adminAreaCodes.join(", "), ""],
                                  },
                              ]
                    }
                />
                {sessionWithOrg.isOrgAdmin ? (
                    <>
                        <FormGroupWrapper errorIds={["emailNotificationPreferences"]} errors={errors}>
                            <FormElementWrapper
                                errors={errors}
                                errorId={"emailNotificationPreferences"}
                                errorClass="govuk-radios-email---error"
                            >
                                <div className="mb-12">
                                    <h2 className="govuk-heading-m">Email Notifications</h2>
                                    <div className="flex flex-row items-center">
                                        <p className="font-bold mr-28">Disruptions requiring approval</p>
                                        <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                                            <div className="govuk-radios__item">
                                                <input
                                                    className="govuk-radios__input"
                                                    id={`email-notification-on`}
                                                    name={`email-notification-on`}
                                                    type="radio"
                                                    value="true"
                                                    checked={emailNotificationPreference}
                                                    onChange={async () => {
                                                        await updateEmailNotificationPreferences(true);
                                                    }}
                                                />
                                                <label
                                                    key={`email-notification-on`}
                                                    htmlFor={`email-notification-on`}
                                                    className="govuk-label govuk-radios__label"
                                                >
                                                    On
                                                </label>
                                            </div>
                                            <div className="govuk-radios__item">
                                                <input
                                                    className="govuk-radios__input"
                                                    id={`email-notification-off`}
                                                    name={`email-notification-off`}
                                                    type="radio"
                                                    value="false"
                                                    checked={!emailNotificationPreference}
                                                    onChange={async () => {
                                                        await updateEmailNotificationPreferences(false);
                                                    }}
                                                />
                                                <label
                                                    key={`email-notification-off`}
                                                    htmlFor={`email-notification-offf`}
                                                    className="govuk-label govuk-radios__label"
                                                >
                                                    Off
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FormElementWrapper>
                        </FormGroupWrapper>
                        <h2 className="govuk-heading-m">From which source shall we acquire your data</h2>
                        <FormGroupWrapper errorIds={["modes"]} errors={errors}>
                            <FormElementWrapper errors={errors} errorId={"modes"} errorClass="govuk-radios--error">
                                <Table
                                    rows={Object.keys(mode).map((key) => ({
                                        header:
                                            key === "ferryService"
                                                ? "Ferry"
                                                : `${key.charAt(0).toUpperCase()}${key.slice(1, key.length)}`,
                                        cells: [datasourceRadioButtons(key, mode[key as keyof ModeType])],
                                    }))}
                                />
                            </FormElementWrapper>
                        </FormGroupWrapper>
                    </>
                ) : null}
                {sessionWithOrg.isSystemAdmin ? (
                    <Link
                        role="button"
                        href={SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH}
                        className="govuk-button mt-2 govuk-button--secondary"
                    >
                        Return to Manage Organisations
                    </Link>
                ) : null}
            </div>
        </TwoThirdsLayout>
    );

    function datasourceRadioButtons(name: string, inputValue: string) {
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
                            await updateOrg(name, Datasource.tnds);
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
                            await updateOrg(name, Datasource.bods);
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
