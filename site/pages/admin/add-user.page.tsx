import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useState } from "react";
import { createFilter, SingleValue } from "react-select";
import type { FilterOptionOption } from "react-select/dist/declarations/src/filters";
import CsrfForm from "../../components/form/CsrfForm";
import ErrorSummary from "../../components/form/ErrorSummary";
import Radios from "../../components/form/Radios";
import SearchSelect from "../../components/form/SearchSelect";
import Table from "../../components/form/Table";
import TextInput from "../../components/form/TextInput";
import { TwoThirdsLayout } from "../../components/layout/Layout";
import { COOKIES_ADD_USER_ERRORS } from "../../constants";
import { fetchOperatorUserNocCodes } from "../../data/refDataApi";
import { PageState } from "../../interfaces";
import { AddUserSchema, addUserSchema, OperatorData, operatorDataSchema } from "../../schemas/add-user.schema";

import { flattenZodErrors } from "../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";
import { getStateUpdater } from "../../utils/formUtils";

const title = "Add User - Create Transport Disruptions Service";
const description = "Add User page for the Create Transport Disruptions Service";

const filterConfig = {
    ignoreCase: true,
    ignoreAccents: false,
    stringify: <Option extends object>(option: FilterOptionOption<Option>) => `${option.label}`,
    trim: true,
    matchFrom: "any" as const,
};

export interface AddUserPageProps extends PageState<Partial<AddUserSchema>> {
    operatorData?: OperatorData[];
}

const AddUser = (props: AddUserPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);
    const [selectedOperator, setSelectedOperator] = useState<SingleValue<OperatorData>>(null);
    const [operatorSearchInput, setOperatorsSearchInput] = useState<string>("");

    const stateUpdater = getStateUpdater(setPageState, pageState);

    console.log(pageState.inputs);

    const operatorNocCodesList = pageState.operatorData ?? [];

    const handleOperatorChange = (value: SingleValue<OperatorData>) => {
        const parsed = operatorDataSchema.safeParse(value);

        if (!parsed.success) {
            setPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter((err) => !Object.keys(addUserSchema.shape).includes(err.id)),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            setSelectedOperator(parsed.data);
            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    operatorNocInfo: [...(pageState.inputs.operatorNocInfo ?? []), parsed.data],
                },
                errors: [...pageState.errors.filter((err) => !Object.keys(addUserSchema.shape).includes(err.id))],
            });
        }
    };

    const removeOperator = (e: SyntheticEvent, removedNocCode: string) => {
        e.preventDefault();

        if (pageState?.inputs?.operatorNocInfo) {
            const updatedOperatorNocInfoArray = [...pageState.inputs.operatorNocInfo].filter(
                (operator) => operator.nocCode !== removedNocCode,
            );

            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    operatorNocInfo: updatedOperatorNocInfoArray,
                },
                errors: pageState.errors,
            });
        }
        setSelectedOperator(null);
    };

    const getOperatorRows = () => {
        if (pageState.inputs.operatorNocInfo) {
            return pageState.inputs.operatorNocInfo.map((operator) => ({
                cells: [
                    `${operator.nocCode} - ${operator.operatorPublicName}`,
                    <button
                        id={`remove-service-${operator.nocCode}`}
                        key={`remove-service-${operator.nocCode}`}
                        className="govuk-link"
                        onClick={(e) => Promise.resolve(removeOperator(e, operator.nocCode))}
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
                        stateUpdater={stateUpdater}
                        maxLength={100}
                    />
                    <TextInput<AddUserSchema>
                        display="Last name"
                        inputName="familyName"
                        widthClass="w"
                        value={pageState.inputs.familyName}
                        initialErrors={pageState.errors}
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
                            {
                                value: UserGroups.operators,
                                display: "Operator",
                            },
                        ]}
                        inputName="group"
                        stateUpdater={stateUpdater}
                        value={pageState.inputs.group?.toString()}
                        initialErrors={pageState.errors}
                    />

                    {pageState.inputs.group === "operators" && (
                        <div className={"ml-[8%]"}>
                            <SearchSelect<OperatorData>
                                selected={selectedOperator}
                                inputName="operatorNocInfo"
                                initialErrors={pageState.errors}
                                placeholder="Select operator NOC codes"
                                getOptionLabel={(operator) => `${operator.nocCode} - ${operator.operatorPublicName}`}
                                options={operatorNocCodesList.filter((operatorOption) =>
                                    pageState.inputs.operatorNocInfo
                                        ? !pageState.inputs.operatorNocInfo.find(
                                              (selectedOperators) => selectedOperators.id === operatorOption.id,
                                          )
                                        : true,
                                )}
                                handleChange={handleOperatorChange}
                                tableData={pageState?.inputs?.operatorNocInfo}
                                getRows={getOperatorRows}
                                getOptionValue={(operator: OperatorData) => operator.id.toString()}
                                display="NOC Codes"
                                hint=""
                                displaySize="s"
                                inputId="operatorNocInfo"
                                isClearable
                                inputValue={operatorSearchInput}
                                filterOptions={createFilter(filterConfig)}
                                setSearchInput={setOperatorsSearchInput}
                            />
                        </div>
                    )}

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

    const bodsModes: string[] = [];
    const tndsModes: string[] = [];

    Object.entries(session.mode).map((mode) =>
        mode[1] === "bods"
            ? bodsModes.push(mode[0] === "ferryService" ? "ferry" : mode[0])
            : tndsModes.push(mode[0] === "ferryService" ? "ferry" : mode[0]),
    );

    const operatorsData = await fetchOperatorUserNocCodes({
        adminAreaCodes: session.adminAreaCodes ?? ["undefined"],
        tndsModes: tndsModes,
        bodsModes: bodsModes,
    });

    return {
        props: {
            ...getPageState(errorCookie, addUserSchema),
            sessionWithOrg: session,
            operatorData: operatorsData ?? [],
        },
    };
};

export default AddUser;
