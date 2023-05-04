import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../components/ErrorSummary";
import CsrfForm from "../components/form/CsrfForm";
import TextInput from "../components/form/TextInput";
import { BaseLayout } from "../components/layout/Layout";
import { COOKIES_LOGIN_ERRORS } from "../constants";
import { PageState } from "../interfaces";
import { LoginProps, loginSchema } from "../schemas/login.schema";
import { getPageState } from "../utils/apiUtils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Sign in - Create Transport Disruptions Service";
const description = "Login page for the Create Transport Disruptions Service";

export interface LoginPageProps extends PageState<Partial<LoginProps>> {}

const Login = (props: LoginPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    return (
        <BaseLayout title={title} description={description} errors={pageState.errors}>
            <h1 className="govuk-heading-xl">Sign in</h1>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <CsrfForm action="/api/login" method="post" csrfToken={pageState.csrfToken}>
                        <>
                            <ErrorSummary errors={pageState.errors} />

                            <h2 className="govuk-heading-m w-3/4">
                                Enter your Create Transport Disruption Data account details to sign in
                            </h2>

                            <TextInput<LoginProps>
                                display="Email address"
                                inputName="email"
                                widthClass="w-3/4"
                                value={pageState.inputs.email}
                                initialErrors={pageState.errors}
                                schema={loginSchema.shape.email}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                            />

                            <TextInput<LoginProps>
                                display="Password"
                                inputName="password"
                                widthClass="w-3/4"
                                value={pageState.inputs.password}
                                initialErrors={pageState.errors}
                                schema={loginSchema.shape.password}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                                isPassword
                            />

                            <button className="govuk-button mt-8">Sign In</button>
                        </>
                    </CsrfForm>
                </div>
                <div className="govuk-grid-column-one-third">
                    <div>
                        <h2 className="govuk-heading-m">Forgot your Password?</h2>
                        <a href="/forgotPassword" className="govuk-link govuk-!-font-size-19">
                            Reset your password
                        </a>
                    </div>
                    <br />
                    <div>
                        <h2 className="govuk-heading-m">Don&apos;t have an account?</h2>
                        <a
                            href="/requestAccess"
                            className="govuk-link govuk-!-font-size-19"
                            aria-label="Don't have an account? - Request access"
                        >
                            Request access
                        </a>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: LoginPageProps } => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_LOGIN_ERRORS];

    return {
        props: {
            ...getPageState(errorCookie, loginSchema),
        },
    };
};

export default Login;
