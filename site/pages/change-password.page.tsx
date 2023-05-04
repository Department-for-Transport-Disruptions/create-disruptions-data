import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../components/ErrorSummary";
import CsrfForm from "../components/form/CsrfForm";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import { TwoThirdsLayout } from "../components/layout/Layout";
import { ACCOUNT_SETTINGS_PAGE_PATH, COOKIES_CHANGE_PASSWORD_ERRORS } from "../constants";
import { PageState } from "../interfaces";
import {
    ChangePasswordProps,
    changePasswordSchema,
    changePasswordSchemaRefined,
} from "../schemas/change-password.schema";
import { getPageState } from "../utils/apiUtils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Change Password - Create Transport Disruptions Service";
const description = "Change Password page for the Create Transport Disruptions Service";

export interface ChangePasswordPageProps extends PageState<Partial<ChangePasswordProps>> {}

const ChangePassword = (props: ChangePasswordPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    const getRows = () => [
        {
            header: "Email address",
            cells: ["user.name@bus.co.uk"],
        },
        {
            header: "Organisation",
            cells: ["Nexus"],
        },
    ];

    const queryParams = useRouter().query;
    const displaySuccessMessage = queryParams["success"];

    return (
        <TwoThirdsLayout title={title} description={description} errors={pageState.errors}>
            <CsrfForm action="/api/change-password" method="post" csrfToken={pageState.csrfToken}>
                <>
                    <ErrorSummary errors={pageState.errors} />
                    <h1 className="govuk-heading-xl">Change password</h1>
                    {displaySuccessMessage ? (
                        <>
                            <h2 className="govuk-heading-m">Your password has been successfully updated.</h2>
                            <Link role="button" href={ACCOUNT_SETTINGS_PAGE_PATH} className="govuk-button mt-8">
                                Return to account settings
                            </Link>
                        </>
                    ) : (
                        <>
                            <Table rows={getRows()} />
                            <TextInput<ChangePasswordProps>
                                display="Current password"
                                inputName="currentPassword"
                                widthClass="w"
                                value={pageState.inputs.currentPassword}
                                initialErrors={pageState.errors}
                                schema={changePasswordSchema.shape.currentPassword}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                                isPassword
                            />

                            <TextInput<ChangePasswordProps>
                                display="New password"
                                inputName="newPassword"
                                widthClass="w"
                                value={pageState.inputs.newPassword}
                                initialErrors={pageState.errors}
                                schema={changePasswordSchema.shape.newPassword}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                                hint="Your password should be at least 8 characters long"
                                isPassword
                            />

                            <TextInput<ChangePasswordProps>
                                display="Confirm new password"
                                inputName="confirmPassword"
                                widthClass="w"
                                value={pageState.inputs.confirmPassword}
                                initialErrors={pageState.errors}
                                schema={changePasswordSchema.shape.confirmPassword}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                                isPassword={true}
                            />

                            <button className="govuk-button mt-8">Save password</button>
                            <Link
                                role="button"
                                href={ACCOUNT_SETTINGS_PAGE_PATH}
                                className="govuk-button mt-8 ml-10 govuk-button--secondary"
                            >
                                Cancel
                            </Link>
                        </>
                    )}
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: ChangePasswordPageProps } => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_CHANGE_PASSWORD_ERRORS];

    return {
        props: {
            ...getPageState(errorCookie, changePasswordSchemaRefined),
        },
    };
};

export default ChangePassword;
