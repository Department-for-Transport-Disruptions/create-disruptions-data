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
import { COOKIES_RESET_PASSWORD_ERRORS, LOGIN_PAGE_PATH, MIN_PASSWORD_LENGTH } from "../constants";
import { PageState } from "../interfaces";
import { resetPasswordSchema, ResetPasswordSchema, resetPasswordSchemaRefined } from "../schemas/reset-password.schema";
import { redirectTo } from "../utils";
import { getPageState } from "../utils/apiUtils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Reset Password - Create Transport Disruptions Service";
const description = "Reset Password page for the Create Transport Disruptions Service";

export interface ResetPasswordPageProps extends PageState<Partial<ResetPasswordSchema>> {}
//TODO DEANNA Change email to dynamically render from query params in TABLE
const ResetPassword = (props: ResetPasswordPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    const queryParams = useRouter().query;
    const displaySuccessMessage = queryParams["success"];
    const email = props.inputs.email || "";
    return (
        <TwoThirdsLayout title={title} description={description} errors={pageState.errors}>
            <CsrfForm action="/api/reset-password" method="post" csrfToken={pageState.csrfToken}>
                <>
                    <ErrorSummary errors={pageState.errors} />
                    <h1 className="govuk-heading-xl">Reset password</h1>
                    {displaySuccessMessage ? (
                        <>
                            <h2 className="govuk-heading-m">Your password has been successfully updated.</h2>
                            <Link role="button" href={LOGIN_PAGE_PATH} className="govuk-button mt-8">
                                Return to login
                            </Link>
                        </>
                    ) : (
                        <>
                            <Table
                                rows={[
                                    {
                                        header: "Email address",
                                        cells: [`${email}`],
                                    },
                                ]}
                            />
                            <TextInput<ResetPasswordSchema>
                                display="New password"
                                inputName="newPassword"
                                widthClass="w"
                                value={pageState.inputs.newPassword}
                                initialErrors={pageState.errors}
                                schema={resetPasswordSchema.shape.newPassword}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                                hint={`Your password should be at least ${MIN_PASSWORD_LENGTH} characters long`}
                                isPassword
                            />

                            <TextInput<ResetPasswordSchema>
                                display="Confirm new password"
                                inputName="confirmPassword"
                                widthClass="w"
                                value={pageState.inputs.confirmPassword}
                                initialErrors={pageState.errors}
                                schema={resetPasswordSchema.shape.confirmPassword}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                                isPassword
                            />

                            <input type="hidden" name="email" value={pageState.inputs.email} />
                            <input type="hidden" name="key" value={pageState.inputs.key} />

                            <button className="govuk-button mt-8">Save password</button>
                        </>
                    )}
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: ResetPasswordPageProps } | void => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_RESET_PASSWORD_ERRORS];

    const { user_name, key } = ctx.query;

    if (!key || !user_name) {
        if (ctx.res) {
            redirectTo(ctx.res, "/forgot-password");
        }
        return;
    }

    const pageState = getPageState(errorCookie, resetPasswordSchemaRefined);

    pageState.inputs.key = key.toString();
    pageState.inputs.email = user_name.toString();

    return {
        props: {
            ...pageState,
        },
    };
};

export default ResetPassword;
