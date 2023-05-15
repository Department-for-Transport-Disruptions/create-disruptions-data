import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, ReactNode, useState } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import PageNumbers from "../../components/PageNumbers";
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

const UserManagement = ({ userList }: UserManagementPageProps): ReactElement => {
    const numberOfUserPages = Math.ceil(userList.length / 10);
    const [currentPage, setCurrentPage] = useState(1);

    const getAccountType = (groupName: UserGroups): string => {
        switch (groupName) {
            case UserGroups.systemAdmins:
            case UserGroups.orgAdmins:
                return "Admin";
            case UserGroups.orgPublishers:
                return "Publisher";
            case UserGroups.orgStaff:
                return "Staff";
        }
    };

    const getRows = () => {
        const rows: { header?: string | ReactNode; cells: string[] | ReactNode[] }[] = [];
        getDataInPages(currentPage, userList).forEach((user, index) => {
            rows.push({
                cells: [
                    `${getAccountType(user.group)}`,
                    user.email,
                    user.userStatus === "CONFIRMED" ? "Active" : "Pending invite",
                    createLink("user-action", index, user.userStatus === "CONFIRMED" ? false : true),
                ],
            });
        });
        return rows;
    };

    const createLink = (key: string, index?: number, sendInvite?: boolean) => {
        return sendInvite ? (
            <>
                <Link key={`${key}${index ? `-${index}` : ""}`} className="govuk-link" href="/">
                    Resend invite
                </Link>
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
    if (!sessionWithOrg) {
        throw new Error("No session found");
    }
    const userRecords = await listUsersWithGroups();

    if (!userRecords) {
        return {
            props: {
                userList: [],
            },
        };
    }

    const userList = userManagementSchema
        .parse(userRecords)
        .filter((user) => user.organisation === sessionWithOrg.orgId);

    return {
        props: { userList },
    };
};

export default UserManagement;
