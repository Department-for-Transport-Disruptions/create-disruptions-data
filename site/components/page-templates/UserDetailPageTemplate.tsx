import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import Link from "next/link";
import { Dispatch, SetStateAction, SyntheticEvent, useState } from "react";
import { SingleValue } from "react-select";
import { AddUserPageProps } from "../../pages/admin/add-user.page";
import { EditUserPageProps } from "../../pages/admin/edit-user/[username].page";
import { addUserSchema, AddUserSchema, EditUserSchema } from "../../schemas/add-user.schema";
import { OperatorOrgSchema, operatorOrgSchema } from "../../schemas/organisation.schema";
import { flattenZodErrors } from "../../utils";
import { getStateUpdater } from "../../utils/formUtils";
import CsrfForm from "../form/CsrfForm";
import ErrorSummary from "../form/ErrorSummary";
import Radios from "../form/Radios";
import SearchSelect from "../form/SearchSelect";
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
    const [selectedOperator, setSelectedOperator] = useState<SingleValue<OperatorOrgSchema>>(
        pageState.inputs.operatorOrg ?? null,
    );
    const [operatorSearchInput, setOperatorsSearchInput] = useState<string>("");

    const operatorsListForOrg = pageState.operatorsForOrg ?? [];

    const handleOperatorChange = (value: SingleValue<OperatorOrgSchema>) => {
        const parsed = operatorOrgSchema.safeParse(value);

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
                    operatorOrg: parsed.data,
                },
                errors: [...pageState.errors.filter((err) => !Object.keys(addUserSchema.shape).includes(err.id))],
            });
        }
    };

    const removeOperator = (e: SyntheticEvent) => {
        e.preventDefault();

        setPageState({
            ...pageState,
            inputs: {
                ...pageState.inputs,
                operatorOrg: undefined,
            },
            errors: pageState.errors,
        });
        setSelectedOperator(null);
    };

    const getOperatorRows = () => {
        if (pageState.inputs.operatorOrg) {
            return [pageState.inputs.operatorOrg].map((operator: OperatorOrgSchema) => ({
                cells: [
                    `${operator.name}`,
                    <button
                        id={`remove-service-${operator.name}`}
                        key={`remove-service-${operator.name}`}
                        className="govuk-link"
                        onClick={(e) => removeOperator(e)}
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
                        <h1 className="govuk-heading-xl">{pageType === "addUser" ? "Add new user" : "Edit a user"}</h1>
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
                                    display: "Publisher",
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
                            <>
                                <div className={"ml-[8%]"}>
                                    <SearchSelect<OperatorOrgSchema>
                                        selected={selectedOperator}
                                        inputName="operatorOrg"
                                        initialErrors={pageState.errors}
                                        placeholder="Select operator to assign to user"
                                        getOptionLabel={(operator) => `${operator.name}`}
                                        options={operatorsListForOrg
                                            .filter((operatorOption) => selectedOperator?.name !== operatorOption.name)
                                            .sort((a, b) => a.name.localeCompare(b.name))}
                                        handleChange={handleOperatorChange}
                                        tableData={undefined}
                                        getRows={getOperatorRows}
                                        getOptionValue={(operator: OperatorOrgSchema) => operator.name}
                                        display=""
                                        hint=""
                                        displaySize="s"
                                        inputId="operatorOrg"
                                        isClearable={false}
                                        inputValue={operatorSearchInput}
                                        setSearchInput={setOperatorsSearchInput}
                                    />
                                </div>

                                <input
                                    type="hidden"
                                    name="operatorOrg"
                                    value={JSON.stringify(pageState.inputs.operatorOrg) ?? undefined}
                                />
                            </>
                        )}

                        {pageType === "editUser" && (
                            <>
                                <input type="hidden" name={`email`} value={pageState.inputs.email} />
                                <input type="hidden" name={`username`} value={username} />
                                <input type="hidden" name={`initialGroup`} value={initialGroup} />
                            </>
                        )}

                        <button className="govuk-button mt-8 mr-5" data-module="govuk-button">
                            {pageType === "addUser" ? "Send invitation" : "Save"}
                        </button>
                        <Link
                            role="button"
                            href="/admin/user-management"
                            className="govuk-button mt-8 govuk-button--secondary"
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
