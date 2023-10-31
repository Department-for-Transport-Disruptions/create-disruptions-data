import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { AddUserPageProps } from "../../pages/admin/add-user.page";
import { EditUserPageProps } from "../../pages/admin/edit-user/[username].page";
import { addUserSchema, AddUserSchema, EditUserSchema } from "../../schemas/add-user.schema";
import { getStateUpdater } from "../../utils/formUtils";
import CsrfForm from "../form/CsrfForm";
import ErrorSummary from "../form/ErrorSummary";
import Radios from "../form/Radios";
import Table from "../form/Table";
import TextInput from "../form/TextInput";
import { TwoThirdsLayout } from "../layout/Layout";

interface Props {
    pageType: "editUser" | "addUser";
    title: string;
    description: string;
    pageState: EditUserPageProps | AddUserPageProps;
    username?: string;
    initialGroup?: string;
    setPageState: Dispatch<SetStateAction<EditUserPageProps | AddUserPageProps>>;
}

const UserDetailPageTemplate = ({
    pageType,
    title,
    description,
    pageState,
    username,
    initialGroup,
    setPageState,
}: Props) => {
    const stateUpdater = getStateUpdater(setPageState, pageState);

    return (
        <>
            <TwoThirdsLayout title={title} description={description} errors={pageState.errors}>
                <CsrfForm
                    action={pageType === "addUser" ? "/api/admin/add-user" : "/api/admin/edit-user"}
                    method="post"
                    csrfToken={pageState.csrfToken}
                >
                    <>
                        <ErrorSummary errors={pageState.errors} />
                        <h1 className="govuk-heading-xl">{pageType === "addUser" ? "Add new user" : "Edit user"}</h1>
                        <TextInput<AddUserSchema | EditUserSchema>
                            display="First name"
                            inputName="givenName"
                            widthClass="w"
                            value={pageState.inputs.givenName}
                            initialErrors={pageState.errors}
                            stateUpdater={stateUpdater}
                            maxLength={100}
                        />
                        <TextInput<AddUserSchema | EditUserSchema>
                            display="Last name"
                            inputName="familyName"
                            widthClass="w"
                            value={pageState.inputs.familyName}
                            initialErrors={pageState.errors}
                            stateUpdater={stateUpdater}
                            maxLength={100}
                        />
                        <TextInput<AddUserSchema | EditUserSchema>
                            display="Email address"
                            inputName="email"
                            widthClass="w"
                            value={pageState.inputs.email}
                            initialErrors={pageState.errors}
                            schema={addUserSchema.shape.email}
                            stateUpdater={stateUpdater}
                            maxLength={100}
                            isDisabled={pageType === "addUser" ? false : true}
                        />

                        <Table rows={[{ header: "Organisation", cells: [pageState.sessionWithOrg?.orgName, ""] }]} />

                        <Radios<AddUserSchema | EditUserSchema>
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

                        {pageType === "editUser" && (
                            <>
                                <input type="hidden" name={`email`} value={pageState.inputs.email} />
                                <input type="hidden" name={`username`} value={username} />
                                <input type="hidden" name={`initialGroup`} value={initialGroup} />
                            </>
                        )}

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            {pageType === "addUser" ? "Send invitation" : "Save"}
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
        </>
    );
};

export default UserDetailPageTemplate;
