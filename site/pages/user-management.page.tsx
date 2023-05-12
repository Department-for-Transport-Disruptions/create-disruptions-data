import Link from "next/link";
import { ReactElement, ReactNode } from "react";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import { listUsersWithGroups } from "../data/cognito";
import { UserManagementSchema, userManagementSchema } from "../schemas/user-management.schema";

const title = "User Management";
const description = "User Management page for the Create Transport Disruptions Service";

export interface UserManagementPageProps {
    userList: UserManagementSchema;
    csrfToken?: string;
}

const UserManagement = ({ userList }: UserManagementPageProps): ReactElement => {
    const getRows = () => {
        const rows: { header?: string | ReactNode; cells: string[] | ReactNode[] }[] = [];
        userList.forEach((user, index) => {
            rows.push({
                cells: [
                    user.group.toLowerCase().includes("admin") ? "Admin" : "Restricted",
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
                <Link key={`${key}${index ? `-${index}` : ""}`} className="govuk-link" href="/">
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
            </>
        </BaseLayout>
    );
};

export const getServerSideProps = async (): Promise<{ props: UserManagementPageProps }> => {
    const cognitoUsers = await listUsersWithGroups();

    const userList = userManagementSchema.parse(cognitoUsers);

    return {
        props: { userList },
    };
};

export default UserManagement;
