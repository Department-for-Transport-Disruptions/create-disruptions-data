import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import Link from "next/link";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { createFilter, SingleValue } from "react-select";
import type { FilterOptionOption } from "react-select/dist/declarations/src/filters";
import CsrfForm from "./form/CsrfForm";
import ErrorSummary from "./form/ErrorSummary";
import Radios from "./form/Radios";
import SearchSelect from "./form/SearchSelect";
import Table from "./form/Table";
import TextInput from "./form/TextInput";
import { TwoThirdsLayout } from "./layout/Layout";
import { AddUserPageProps } from "../pages/admin/add-user.page";
import { EditUserPageProps } from "../pages/admin/edit-user/[username].page";
import { addUserSchema, AddUserSchema, OperatorData } from "../schemas/add-user.schema";
import { sortOperatorByName } from "../utils";

const filterConfig = {
    ignoreCase: true,
    ignoreAccents: false,
    stringify: <Option extends object>(option: FilterOptionOption<Option>) => `${option.label}`,
    trim: true,
    matchFrom: "any" as const,
};

interface Props {
    pageType: "editUser" | "addUser";
    title: string;
    description: string;
    pageState: EditUserPageProps | AddUserPageProps;
    username?: string;
    initialGroup?: string;
    stateUpdater: (
        a: string,
        field: "operatorNocCodes" | "email" | "orgId" | "givenName" | "familyName" | "group",
    ) => void;
    operatorNocCodesList: OperatorData[];
    removeOperator: (e: SyntheticEvent, a: string) => void;
    selectedOperator: SingleValue<OperatorData>;
    handleOperatorChange: (value: SingleValue<OperatorData>) => void;
    operatorSearchInput: string;
    setOperatorsSearchInput: Dispatch<SetStateAction<string>>;
}

const UserPageTemplate = ({
    pageType,
    title,
    description,
    pageState,
    username,
    initialGroup,
    stateUpdater,
    operatorNocCodesList,
    removeOperator,
    selectedOperator,
    handleOperatorChange,
    operatorSearchInput,
    setOperatorsSearchInput,
}: Props) => {
    const getOperatorRows = () => {
        if (pageState.inputs.operatorNocCodes) {
            return sortOperatorByName(pageState.inputs.operatorNocCodes).map((operator) => ({
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
        <>
            <TwoThirdsLayout title={title} description={description} errors={pageState.errors}>
                <CsrfForm
                    action={pageType === "addUser" ? "/api/admin/add-user" : "/api/admin/edit-user"}
                    method="post"
                    csrfToken={pageState.csrfToken}
                >
                    <>
                        <ErrorSummary errors={pageState.errors} />
                        <h1 className="govuk-heading-xl">{pageType === "addUser" ? "Add User" : "Edit user"}</h1>
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
                            isDisabled={pageType === "addUser" ? false : true}
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

                        {pageState.inputs.group === UserGroups.operators && (
                            <div className={"ml-[8%]"}>
                                <SearchSelect<OperatorData>
                                    selected={selectedOperator}
                                    inputName="operatorNocCodes"
                                    initialErrors={pageState.errors}
                                    placeholder="Select operator NOC codes"
                                    getOptionLabel={(operator) =>
                                        `${operator.nocCode} - ${operator.operatorPublicName}`
                                    }
                                    options={sortOperatorByName(operatorNocCodesList).filter((operatorOption) =>
                                        pageState.inputs.operatorNocCodes
                                            ? !pageState.inputs.operatorNocCodes.find(
                                                  (selectedOperators) => selectedOperators.id === operatorOption.id,
                                              )
                                            : true,
                                    )}
                                    handleChange={handleOperatorChange}
                                    tableData={pageState.inputs.operatorNocCodes}
                                    getRows={getOperatorRows}
                                    getOptionValue={(operator: OperatorData) => operator.id.toString()}
                                    display="NOC Codes"
                                    hint=""
                                    displaySize="s"
                                    inputId="operatorNocCodes"
                                    isClearable
                                    inputValue={operatorSearchInput}
                                    filterOptions={createFilter(filterConfig)}
                                    setSearchInput={setOperatorsSearchInput}
                                />
                            </div>
                        )}

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

export default UserPageTemplate;
