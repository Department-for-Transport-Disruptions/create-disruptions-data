import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../../components/ErrorSummary";
import CsrfForm from "../../components/form/CsrfForm";
import Radios from "../../components/form/Radios";
import Table from "../../components/form/Table";
import TextInput from "../../components/form/TextInput";
import { TwoThirdsLayout } from "../../components/layout/Layout";
import { COOKIES_ADD_USER_ERRORS } from "../../constants";
import { PageState } from "../../interfaces";
import { AddUserSchema, addUserSchema } from "../../schemas/add-user.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";
import { getStateUpdater } from "../../utils/formUtils";

const title = "Add User - Create Transport Disruptions Service";
const description = "Add User page for the Create Transport Disruptions Service";

export interface AddUserPageProps extends PageState<Partial<AddUserSchema>> {}

const AddUser = (props: AddUserPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    return (
        <TwoThirdsLayout title={title} description={description} errors={pageState.errors}>
            <CsrfForm action="/api/admin/add-user" method="post" csrfToken={pageState.csrfToken}>
                <>
                    <ErrorSummary errors={pageState.errors} />
                    <h1 className="govuk-heading-xl">Add new user</h1>
                    <TextInput<AddUserSchema>
                        display="First name"
                        inputName="givenName"
                        widthClass="w"
                        value={pageState.inputs.givenName}
                        initialErrors={pageState.errors}
                        schema={addUserSchema.shape.givenName}
                        stateUpdater={stateUpdater}
                        maxLength={100}
                    />
                    <TextInput<AddUserSchema>
                        display="Last name"
                        inputName="familyName"
                        widthClass="w"
                        value={pageState.inputs.familyName}
                        initialErrors={pageState.errors}
                        schema={addUserSchema.shape.familyName}
                        stateUpdater={stateUpdater}
                        maxLength={100}
                    />
                    <TextInput<AddUserSchema>
                        display="Email address"
                        inputName="email"
                        widthClass="w"
                        value={pageState.inputs.email}
                        initialErrors={pageState.errors}
                        schema={addUserSchema.shape.email}
                        stateUpdater={stateUpdater}
                        maxLength={100}
                    />

                    <Table rows={[{ header: "Organisation", cells: [pageState.sessionWithOrg?.orgName, ""] }]} />

                    <Radios<AddUserSchema>
                        display="What account do they require?"
                        radioDetail={[
                            {
                                value: UserGroups.orgAdmins,
                                display: "Admin",
                            },
                            {
                                value: UserGroups.orgPublishers,
                                display: "Publishing",
                            },
                            {
                                value: UserGroups.orgStaff,
                                display: "Staff",
                            },
                        ]}
                        inputName="group"
                        stateUpdater={stateUpdater}
                        value={pageState.inputs.group?.toString()}
                        initialErrors={pageState.errors}
                    />

                    <button className="govuk-button mt-8" data-module="govuk-button">
                        Send invitation
                    </button>
                    <Link
                        role="button"
                        href="/admin/user-management"
                        className="govuk-button mt-8 ml-5 govuk-button--secondary"
                    >
                        Cancel
                    </Link>
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: AddUserPageProps }> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_ADD_USER_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_ADD_USER_ERRORS, ctx.res);

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    return {
        props: {
            ...getPageState(errorCookie, addUserSchema),
            sessionWithOrg: session,
        },
    };
};

export default AddUser;
