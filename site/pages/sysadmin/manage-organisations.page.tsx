import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, ReactNode, useState } from "react";
import DeleteConfirmationPopup from "../../components/DeleteConfirmationPopup";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import { getOrganisationsInfo } from "../../data/dynamo";
import { Organisations } from "../../schemas/organisation.schema";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";

export interface ManageOrganisationsProps {
    orgList: Organisations;
    csrfToken?: string;
}

const title = "Manage organisations";
const description = "Manage organisations page for the Create Transport Disruptions Service";

const ManageOrganisations = ({ orgList, csrfToken }: ManageOrganisationsProps): ReactElement => {
    const [orgToDelete, setOrgToDelete] = useState<string | null>(null);

    const removeOrg = (orgId: string) => {
        setOrgToDelete(orgId);
    };
    const cancelActionHandler = () => {
        setOrgToDelete(null);
    };
    const getRows = () => {
        const rows: { header?: string | ReactNode; cells: string[] | ReactNode[] }[] = [];
        orgList.forEach((organisation, index) => {
            rows.push({
                cells: [organisation.name, organisation.adminAreaCodes.join(", "), createLink(index, organisation.PK)],
            });
        });
        return rows;
    };

    const createLink = (index: number, orgId: string) => {
        return (
            <div className="flex">
                <Link key={`org${index ? `-edit-${index}` : "-edit"}`} className="govuk-link mr-5" href="#">
                    Edit
                </Link>
                <Link
                    key={`org${index ? `-users-${index}` : "-users"}`}
                    className="govuk-link mr-5"
                    href={`/sysadmin/users?orgId=${orgId}`}
                >
                    Users
                </Link>
                <button
                    key={`org${index ? `-remove-${index}` : "-remove"}`}
                    className="govuk-link text-govBlue"
                    onClick={() => removeOrg(orgId)}
                >
                    Remove
                </button>
            </div>
        );
    };

    return (
        <BaseLayout title={title} description={description}>
            {orgToDelete ? (
                <DeleteConfirmationPopup
                    entityName="org"
                    deleteUrl="/api/sysadmin/delete-org"
                    cancelActionHandler={cancelActionHandler}
                    csrfToken={csrfToken || ""}
                    hiddenInputs={[
                        {
                            name: "org",
                            value: orgToDelete,
                        },
                    ]}
                />
            ) : null}
            <Table
                caption={{ text: "Manage organisations", size: "m" }}
                columns={["Organisation", "NaPTAN AdminArea", "Action"]}
                rows={getRows()}
            ></Table>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ManageOrganisationsProps }> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const sessionWithOrg = await getSessionWithOrgDetail(ctx.req);

    if (!sessionWithOrg) {
        throw new Error("No session found");
    } else if (!sessionWithOrg.isSystemAdmin) {
        throw new Error("Access to system admins only");
    }

    const orgList = (await getOrganisationsInfo()) ?? [];

    return {
        props: {
            orgList,
        },
    };
};

export default ManageOrganisations;
