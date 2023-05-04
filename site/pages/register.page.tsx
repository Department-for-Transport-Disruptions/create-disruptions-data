import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../components/ErrorSummary";
import CsrfForm from "../components/form/CsrfForm";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import { BaseLayout } from "../components/layout/Layout";
import { COOKIES_REGISTER_ERRORS, MIN_PASSWORD_LENGTH } from "../constants";
import { PageState } from "../interfaces";
import { RegisterSchema, registerSchema } from "../schemas/register.schema";
import { redirectTo } from "../utils";
import { getPageState } from "../utils/apiUtils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Register - Create Transport Disruptions Service";
const description = "Register page for the Create Transport Disruptions Service";

export interface RegisterPageProps extends PageState<Partial<RegisterSchema>> {}

const Register = (props: RegisterPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    const getRows = (email: string, organisation?: string) => {
        const rows = [
            {
                header: "Email address",
                cells: [email],
            },
        ];

        if (organisation) {
            rows.push({
                header: "Organisation",
                cells: [organisation],
            });
        }

        return rows;
    };

    return (
        <BaseLayout title={title} description={description} errors={pageState.errors}>
            <h1 className="govuk-heading-xl">Create an account</h1>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <CsrfForm action="/api/register" method="post" csrfToken={pageState.csrfToken}>
                        <>
                            <ErrorSummary errors={pageState.errors} />

                            <Table rows={getRows(pageState.inputs.email || "", pageState.inputs.organisation)} />

                            <TextInput<RegisterSchema>
                                display="Password"
                                inputName="password"
                                hint={`Your password should be at least ${MIN_PASSWORD_LENGTH} characters long`}
                                widthClass="w-3/4"
                                value={pageState.inputs.password}
                                initialErrors={pageState.errors}
                                schema={registerSchema.shape.password}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                                isPassword
                            />

                            <TextInput<RegisterSchema>
                                display="Confirm password"
                                inputName="confirmPassword"
                                widthClass="w-3/4"
                                value={pageState.inputs.confirmPassword}
                                initialErrors={pageState.errors}
                                schema={registerSchema.shape.confirmPassword}
                                stateUpdater={stateUpdater}
                                maxLength={100}
                                isPassword
                            />

                            <input type="hidden" name="email" value={pageState.inputs.email} />
                            <input type="hidden" name="key" value={pageState.inputs.key} />

                            <button className="govuk-button mt-8">Save password</button>
                        </>
                    </CsrfForm>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: RegisterPageProps } | void => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_REGISTER_ERRORS];

    const { key, email, organisation } = ctx.query;

    if (!key || !email) {
        if (ctx.res) {
            redirectTo(ctx.res, "/request-access");
        }

        return;
    }

    const pageState = getPageState(errorCookie, registerSchema);

    pageState.inputs.key = key.toString();
    pageState.inputs.email = email.toString();
    pageState.inputs.organisation = organisation?.toString() ?? "";

    return {
        props: {
            ...pageState,
        },
    };
};

export default Register;
