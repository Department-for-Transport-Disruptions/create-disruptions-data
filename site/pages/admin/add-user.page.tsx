import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useState } from "react";
import { SingleValue } from "react-select";
import UserPageTemplate from "../../components/user-page-template";
import { COOKIES_ADD_USER_ERRORS } from "../../constants";
import { fetchOperators } from "../../data/refDataApi";
import { PageState } from "../../interfaces";
import { AddUserSchema, addUserSchema, OperatorData, operatorDataSchema } from "../../schemas/add-user.schema";
import { flattenZodErrors } from "../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";
import { getStateUpdater } from "../../utils/formUtils";

const title = "Add User - Create Transport Disruptions Service";
const description = "Add User page for the Create Transport Disruptions Service";

export interface AddUserPageProps extends PageState<Partial<AddUserSchema>> {
    operatorData?: OperatorData[];
}

const AddUser = (props: AddUserPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);
    const [selectedOperator, setSelectedOperator] = useState<SingleValue<OperatorData>>(null);
    const [operatorSearchInput, setOperatorsSearchInput] = useState<string>("");

    const stateUpdater = getStateUpdater(setPageState, pageState);

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
                    operatorNocCodes: [...(pageState.inputs.operatorNocCodes ?? []), parsed.data],
                },
                errors: [...pageState.errors.filter((err) => !Object.keys(addUserSchema.shape).includes(err.id))],
            });
        }
    };

    const removeOperator = (e: SyntheticEvent, removedNocCode: string) => {
        e.preventDefault();

        if (pageState?.inputs?.operatorNocCodes) {
            const updatedoperatorNocCodesArray = [...pageState.inputs.operatorNocCodes].filter(
                (operator) => operator.nocCode !== removedNocCode,
            );

            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    operatorNocCodes: updatedoperatorNocCodesArray,
                },
                errors: pageState.errors,
            });
        }
        setSelectedOperator(null);
    };

    return (
        <UserPageTemplate
            pageType={"addUser"}
            title={title}
            description={description}
            pageState={pageState}
            stateUpdater={stateUpdater}
            operatorNocCodesList={operatorNocCodesList}
            removeOperator={removeOperator}
            selectedOperator={selectedOperator}
            handleOperatorChange={handleOperatorChange}
            operatorSearchInput={operatorSearchInput}
            setOperatorsSearchInput={setOperatorsSearchInput}
        />
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

    const operatorsData = await fetchOperators({ adminAreaCodes: session.adminAreaCodes ?? ["undefined"] });
    const filteredOperatorsData = operatorsData
        .map((operator) => {
            return {
                id: operator.id,
                nocCode: operator.nocCode,
                operatorPublicName: operator.operatorPublicName,
            };
        })
        .filter((value, index, self) => index === self.findIndex((s) => s.nocCode === value.nocCode));

    return {
        props: {
            ...getPageState(errorCookie, addUserSchema),
            sessionWithOrg: session,
            operatorData: filteredOperatorsData ?? [],
        },
    };
};

export default AddUser;
