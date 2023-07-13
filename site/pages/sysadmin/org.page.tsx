import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useState } from "react";
import { SingleValue } from "react-select";
import { z } from "zod";
import CsrfForm from "../../components/form/CsrfForm";
import SearchSelect from "../../components/form/SearchSelect";
import TextInput from "../../components/form/TextInput";
import { TwoThirdsLayout } from "../../components/layout/Layout";
import { COOKIES_ADD_ORG_ERRORS, SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH } from "../../constants";
import { getOrganisationInfoById } from "../../data/dynamo";
import { fetchAdminAreaCodes } from "../../data/refDataApi";
import { PageState } from "../../interfaces";
import { Organisation, organisationSchema, areaCodeSchema, AreaCodeValuePair } from "../../schemas/organisation.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";
import { getStateUpdater } from "../../utils/formUtils";

const title = "Manage organisations - Create Transport Disruptions Service";
const description = "Manage organisations page for the Create Transport Disruptions Service";

export interface ManageOrgProps extends Organisation {
    areaCodesDisplay: AreaCodeValuePair[];
}

const ManageOrgs = (props: PageState<Partial<ManageOrgProps>>): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<ManageOrgProps>>>(props);
    const stateUpdater = getStateUpdater(setPageState, pageState);
    const [searchInput, setSearchInput] = useState("");
    const [selected, setSelected] = useState<SingleValue<AreaCodeValuePair>>(null);

    const handleChange = (code: SingleValue<AreaCodeValuePair>) => {
        if (
            code &&
            (!pageState.inputs.adminAreaCodes || !pageState.inputs.adminAreaCodes.some((data) => data === code.value))
        ) {
            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    adminAreaCodes: [...(pageState.inputs.adminAreaCodes ?? []), code.value].sort(),
                },
            });
        }
        setSelected(null);
    };

    const removeCode = (e: SyntheticEvent, index: number) => {
        e.preventDefault();
        if (pageState.inputs.adminAreaCodes) {
            const codes = pageState.inputs.adminAreaCodes;
            codes.splice(index, 1);

            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    adminAreaCodes: codes,
                },
            });
        }
    };

    const getRows = () => {
        if (pageState.inputs.adminAreaCodes) {
            return pageState.inputs.adminAreaCodes.map((code, i) => ({
                cells: [
                    code,
                    <button
                        id={`remove-stop-${code}`}
                        key={`remove-stop-${code}`}
                        className="govuk-link"
                        onClick={(e) => removeCode(e, i)}
                    >
                        Remove
                    </button>,
                ],
            }));
        }
        return [];
    };

    return (
        <TwoThirdsLayout title={title} description={description} errors={pageState.errors}>
            <CsrfForm action="/api/sysadmin/org" method="post" csrfToken={props.csrfToken}>
                <h1 className="govuk-heading-xl">Add new organisation</h1>
                <TextInput<Organisation>
                    display="Organisation name"
                    inputName="name"
                    widthClass="w border-3"
                    value={pageState.inputs.name}
                    initialErrors={pageState.errors}
                    schema={organisationSchema.shape.name}
                    stateUpdater={stateUpdater}
                    maxLength={100}
                />
                <SearchSelect<AreaCodeValuePair>
                    selected={selected}
                    inputName="adminAreaCodes"
                    initialErrors={pageState.errors}
                    placeholder="Select code"
                    getOptionLabel={undefined}
                    handleChange={handleChange}
                    tableData={pageState.inputs.areaCodesDisplay}
                    getRows={getRows}
                    getOptionValue={undefined}
                    display="NaPTAN AdminArea"
                    displaySize="s"
                    inputId="adminAreaCodes"
                    inputValue={searchInput}
                    setSearchInput={setSearchInput}
                    isClearable
                    options={pageState.inputs.areaCodesDisplay}
                    width="100%"
                />

                <input type="hidden" name="PK" value={pageState.inputs.PK} />
                <input type="hidden" name="adminAreaCodes" value={pageState.inputs.adminAreaCodes ?? []} />
                <input type="hidden" name="mode" value={JSON.stringify(pageState.inputs.mode)} />
                <button className="govuk-button mt-2" data-module="govuk-button">
                    {pageState.inputs.PK ? "Update" : "Add"}
                </button>

                <Link
                    role="button"
                    href={SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH}
                    className="govuk-button mt-2 ml-7 govuk-button--secondary"
                >
                    Cancel
                </Link>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: PageState<Partial<ManageOrgProps>> }> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_ADD_ORG_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_ADD_ORG_ERRORS, ctx.res);

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        throw new Error("No session found");
    } else if (!session.isSystemAdmin) {
        throw new Error("Invalid user accessing the page");
    }

    const orgId = ctx.query.orgId?.toString();

    const [orgInfo, areaCodes] = await Promise.all([
        orgId ? getOrganisationInfoById(orgId) : null,
        fetchAdminAreaCodes(),
    ]);

    let pageState: PageState<Partial<Organisation>> = {
        errors: [],
        inputs: {},
    };

    if (errorCookie) {
        pageState = JSON.parse(errorCookie) as PageState<Partial<Organisation>>;
    } else if (orgInfo) {
        pageState.inputs = orgInfo;
    }

    const parsedCodes = z.array(areaCodeSchema).safeParse(areaCodes);
    return {
        props: {
            ...pageState,
            inputs: { ...pageState.inputs, areaCodesDisplay: parsedCodes.success ? parsedCodes.data : [] },
        },
    };
};

export default ManageOrgs;
