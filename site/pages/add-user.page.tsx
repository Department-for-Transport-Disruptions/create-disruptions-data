import { ReactElement, useState } from "react";
import { PageState } from "../interfaces";
import { AddUserSchema, addUserSchema } from "../schemas/add-user.schema";
import { getStateUpdater } from "../utils/formUtils";
import TwoThirdsLayout from "../components/layout/Layout";
import CsrfForm from "../components/form/CsrfForm";
import ErrorSummary from "../components/ErrorSummary";
import TextInput from "../components/form/TextInput";
import Table from "../components/form/Table";
import Radios from "../components/form/Radios";
import { UserGroups } from "@create-disruptions-data/shared-ts/enums";

const title = "Add User - Create Transport Disruptions Service";
const description = "Add User page for the Create Transport Disruptions Service";

export interface AddUserPageProps extends PageState<Partial<AddUserSchema>> {}

const AddUser = (props: AddUserPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    return (
        <TwoThirdsLayout title={title} description={description} errors={pageState.errors}>
            <CsrfForm action="/api/add-user" method="post" csrfToken={pageState.csrfToken}>
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
                        isPassword
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
                        isPassword
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
                        isPassword
                    />

                    <Table rows={[{ header: "Organisation", cells: [pageState.sessionWithOrg?.orgName, ""] }]} />
                    <input type="hidden" name="orgId" value={pageState.sessionWithOrg?.orgId} />

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
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};
