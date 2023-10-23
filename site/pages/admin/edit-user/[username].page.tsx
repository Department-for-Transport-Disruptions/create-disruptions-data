import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useState } from "react";
import { SingleValue } from "react-select";
import UserPageTemplate from "../../../components/user-page-template";
import { COOKIES_EDIT_USER_ERRORS } from "../../../constants";
import { getGroupForUser, getUserDetails } from "../../../data/cognito";
import { fetchOperators } from "../../../data/refDataApi";
import { PageState } from "../../../interfaces";
import { AddUserSchema, addUserSchema, OperatorData, operatorDataSchema } from "../../../schemas/add-user.schema";
import { user } from "../../../schemas/user-management.schema";
import { flattenZodErrors } from "../../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../../utils/apiUtils/auth";
import { getStateUpdater } from "../../../utils/formUtils";

const title = "Edit User - Create Transport Disruptions Service";
const description = "Edit User page for the Create Transport Disruptions Service";

export interface EditUserPageProps extends PageState<Partial<AddUserSchema>> {
    operatorData?: OperatorData[];
    username?: string;
    initialGroup?: string;
}

const EditUser = (props: EditUserPageProps): ReactElement => {
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
            const updatedOperatorNocCodesArray = [...pageState.inputs.operatorNocCodes].filter(
                (operator) => operator.nocCode !== removedNocCode,
            );

            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    operatorNocCodes: updatedOperatorNocCodesArray,
                },
                errors: pageState.errors,
            });
        }
        setSelectedOperator(null);
    };

    return (
        <UserPageTemplate
            pageType={"editUser"}
            title={title}
            description={description}
            pageState={pageState}
            username={props.username ?? ""}
            initialGroup={props.initialGroup ?? ""}
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

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: EditUserPageProps }> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_EDIT_USER_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_EDIT_USER_ERRORS, ctx.res);

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    if (!ctx.query.username) {
        throw new Error("Username not provided");
    }

    const allOperatorsData = await fetchOperators({ adminAreaCodes: session.adminAreaCodes ?? ["undefined"] });

    const filteredOperatorsData = allOperatorsData
        .map((operator) => {
            return {
                id: operator.id,
                nocCode: operator.nocCode,
                operatorPublicName: operator.operatorPublicName,
            };
        })
        .filter((value, index, self) => index === self.findIndex((s) => s.nocCode === value.nocCode));

    const userInfo = await getUserDetails(ctx.query.username.toString());
    const userGroup = await getGroupForUser(ctx.query.username.toString());
    const parsedUserInfo = user.safeParse({ ...userInfo, group: userGroup });

    if (parsedUserInfo.success) {
        const nocCodesArray = parsedUserInfo.data.nocCodes
            .split(",")
            .filter((nocCode) => nocCode)
            .map((nocCode) => nocCode.trim());

        const operatorUserData = filteredOperatorsData.filter((operator) => nocCodesArray.includes(operator.nocCode));

        const info = {
            givenName: parsedUserInfo.data.givenName,
            familyName: parsedUserInfo.data.familyName,
            email: parsedUserInfo.data.email,
            orgId: parsedUserInfo.data.orgId,
            group: parsedUserInfo.data.group,
            operatorNocCodes: operatorUserData,
        };

        const pageState = getPageState<AddUserSchema>(errorCookie, addUserSchema, "fakeId", info);
        return {
            props: {
                ...pageState,
                sessionWithOrg: session,
                operatorData: filteredOperatorsData ?? [],
                username: parsedUserInfo.data.username,
                initialGroup: parsedUserInfo.data.group,
            },
        };
    } else {
        return {
            props: {
                ...getPageState(errorCookie, addUserSchema),
                sessionWithOrg: session,
                operatorData: filteredOperatorsData ?? [],
            },
        };
    }
};

export default EditUser;
