import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, ReactNode, useState } from "react";
import DeleteConfirmationPopup from "../../components/DeleteConfirmationPopup";
import ErrorSummary from "../../components/ErrorSummary";
import CsrfForm from "../../components/form/CsrfForm";
import Table from "../../components/form/Table";
import TextInput from "../../components/form/TextInput";
import { BaseLayout } from "../../components/layout/Layout";
import Popup from "../../components/Popup";
import { COOKIES_ADD_ADMIN_USER_ERRORS } from "../../constants";
import { getUsersInGroupAndOrg } from "../../data/cognito";
import { PageState } from "../../interfaces";
import { AddUserSchema, addUserSchema } from "../../schemas/add-user.schema";
import { AdminSchema, adminSchema } from "../../schemas/user-management.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";
import { getStateUpdater } from "../../utils/formUtils";

const title = "Nexus admins - Create Transport Disruptions Service";
const description = "Nexus admins user page for the Create Transport Disruptions Service";

export interface AdminUserProps extends PageState<Partial<AddUserSchema>> {
    admins?: AdminSchema;
}
const AdminUsers = (props: AdminUserProps): ReactElement => {
    const [pageState, setPageState] = useState(props);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [userToResendInvite, setUserToResendInvite] = useState<{ username: string; userGroup: string } | null>(null);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    const getRows = () => {
        const rows: { header?: string | ReactNode; cells: string[] | ReactNode[] }[] = [];
        props.admins?.forEach((user, index) => {
            rows.push({
                cells: [
                    user.givenName,
                    user.familyName,
                    user.email,
                    createLink("user-action", index, user.username, "system-admins"),
                ],
            });
        });
        return rows;
    };

    const createLink = (key: string, index: number, username: string, userGroup: string) => {
        return (
            <>
                <button
                    key={`${key}${index ? `-${index}` : ""}`}
                    className="govuk-link"
                    onClick={(e) => {
                        e.preventDefault();
                        resendInvite(username, userGroup);
                    }}
                >
                    Resend invite
                </button>
                <br />
                <button
                    key={`${key}${index ? `-remove-${index}` : "-remove"}`}
                    className="govuk-link"
                    onClick={(e) => {
                        e.preventDefault();
                        removeUser(username);
                    }}
                >
                    Remove
                </button>
            </>
        );
    };

    const removeUser = (username: string) => {
        setUserToDelete(username);
    };

    const cancelResendActionHandler = () => {
        setUserToResendInvite(null);
    };
    const resendInvite = (username: string, userGroup: string) => {
        setUserToResendInvite({ username, userGroup });
    };

    const cancelActionHandler = () => {
        setUserToDelete(null);
    };

    const queryParams = useRouter().query;
    const orgId = queryParams["orgId"];

    return (
        <BaseLayout title={title} description={description} errors={pageState.errors}>
            {userToDelete ? (
                <DeleteConfirmationPopup
                    entityName="user"
                    deleteUrl="/api/admin/delete-user"
                    cancelActionHandler={cancelActionHandler}
                    csrfToken={pageState.csrfToken || ""}
                    hiddenInputs={[
                        {
                            name: "username",
                            value: userToDelete,
                        },
                        {
                            name: "orgId",
                            value: orgId?.toString(),
                        },
                    ]}
                />
            ) : null}
            {userToResendInvite ? (
                <Popup
                    action={"/api/admin/resend-invite"}
                    cancelActionHandler={cancelResendActionHandler}
                    csrfToken={pageState.csrfToken || ""}
                    continueText="Yes, resend"
                    cancelText="No, return"
                    hiddenInputs={[
                        {
                            name: "username",
                            value: userToResendInvite.username,
                        },
                        {
                            name: "group",
                            value: userToResendInvite.userGroup,
                        },
                        {
                            name: "orgId",
                            value: orgId?.toString(),
                        },
                    ]}
                    questionText={`Are you sure you wish to resend the invite?`}
                />
            ) : null}
            <ErrorSummary errors={pageState.errors} />
            <h1 className="govuk-heading-xl">Add new user</h1>
            <CsrfForm action="/api/sysadmin/users" method="post" csrfToken={props.csrfToken}>
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

                <input type="hidden" name="orgId" value={orgId} />
                <input type="hidden" name="group" value={UserGroups.systemAdmins} />

                <button className="govuk-button mt-8" data-module="govuk-button">
                    Add and send invitation
                </button>
                <Table columns={["First name", "Last name", "Email", "Action"]} rows={getRows()}></Table>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: AdminUserProps }> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_ADD_ADMIN_USER_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_ADD_ADMIN_USER_ERRORS, ctx.res);

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        throw new Error("No session found");
    } else if (!session.isSystemAdmin) {
        throw new Error("Invalid user accessing the page");
    }

    const orgId = ctx.query.orgId?.toString();

    const adminUsers = orgId ? await getUsersInGroupAndOrg(orgId, "system-admins") : undefined;

    const parsedList = adminSchema.safeParse(adminUsers);

    if (parsedList.success) {
        return {
            props: {
                ...getPageState(errorCookie, addUserSchema),
                admins: parsedList.data,
            },
        };
    }

    return {
        props: {
            ...getPageState(errorCookie, addUserSchema),
        },
    };
};

export default AdminUsers;
