import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, ReactNode, useState } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import PageNumbers from "../../components/PageNumbers";
import Popup from "../../components/Popup";
import { listUsersWithGroups } from "../../data/cognito";
import { UserManagementSchema, userManagementSchema } from "../../schemas/user-management.schema";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";
import { getDataInPages } from "../../utils/formUtils";

const title = "User Management";
const description = "User Management page for the Create Transport Disruptions Service";

export interface UserManagementPageProps {
    userList: UserManagementSchema;
    csrfToken?: string;
}

const UserManagement = ({ userList, csrfToken }: UserManagementPageProps): ReactElement => {
    const numberOfUserPages = Math.ceil(userList.length / 10);
    const [currentPage, setCurrentPage] = useState(1);

    const getOrgDisplay = (orgName: string) => {
        const userGroupName = orgName.includes("-") ? orgName.split("-")[1] : orgName;
        return (
            userGroupName.charAt(0).toUpperCase() +
            (userGroupName.toLowerCase().endsWith("s") ? userGroupName.slice(1, -1) : userGroupName.slice(1))
        );
    };

    const getRows = () => {
        const rows: { header?: string | ReactNode; cells: string[] | ReactNode[] }[] = [];
        getDataInPages(currentPage, userList).forEach((user, index) => {
            rows.push({
                cells: [
                    `${getOrgDisplay(user.group)}`,
                    user.email,
                    user.userStatus === "CONFIRMED" ? "Active" : "Pending invite",
                    createLink("user-action", index, user.userStatus === "CONFIRMED" ? false : true),
                ],
            });
        });
        return rows;
    };

    const cancelActionHandler = () => {
        setShowPopUp(false);
    };
    const resendInvite = () => {
        setShowPopUp(!showPopUp);
    };
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const createLink = (key: string, index: number, sendInvite?: boolean) => {
        return true ? (
            <>
                {showPopUp ? (
                    <Popup
                        action={"/resend-invite"}
                        cancelActionHandler={cancelActionHandler}
                        csrfToken={csrfToken || ""}
                        continueText="Yes, resend"
                        cancelText="No, return"
                        hiddenInputs={[
                            {
                                name: "username",
                                value: userList[index].username,
                            },
                        ]}
                        questionText={`Are you sure you wish to resend the invite?`}
                    />
                ) : null}
                <button key={`${key}${index ? `-${index}` : ""}`} className="govuk-link" onClick={resendInvite}>
                    Resend invite
                </button>
                <br />
                <Link key={`${key}${index ? `-remove-${index}` : "-remove"}`} className="govuk-link" href="/">
                    Remove
                </Link>
            </>
        ) : (
            <Link key={`${key}${index ? `-${index}` : ""}`} className="govuk-link" href="/">
                Remove
            </Link>
        );
    };

    return (
        <BaseLayout title={title} description={description}>
            <>
                <div className="govuk-form-group">
                    <h1 className="govuk-heading-xl">User Management</h1>
                </div>
                <Table
                    caption={{ text: "Users", size: "m" }}
                    columns={["Account type", "User email", "Status", "Action"]}
                    rows={getRows()}
                ></Table>
                <Link role="button" href={"/add-user"} className="govuk-button--secondary govuk-button mt-5">
                    Add new user
                </Link>

                <PageNumbers
                    numberOfPages={numberOfUserPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: UserManagementPageProps }> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const sessionWithOrg = await getSessionWithOrgDetail(ctx.req);
    const userRecords = await listUsersWithGroups();

    let userList: UserManagementSchema = [];
    const reducedList: UserManagementSchema = [];

    if (userRecords) userList = userManagementSchema.parse(userRecords);

    userList = userList.reduce((reducedUserList, user) => {
        if (user.organisation === sessionWithOrg?.orgId) {
            reducedUserList.push({ ...user, organisation: sessionWithOrg.orgName });
        }
        return reducedUserList;
    }, reducedList);

    return {
        props: { userList },
    };
};

export default UserManagement;
