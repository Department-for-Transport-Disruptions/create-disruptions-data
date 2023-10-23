import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import UserDetailPageTemplate from "../../components/page-templates/UserDetailPageTemplate";
import { COOKIES_ADD_USER_ERRORS } from "../../constants";
import { fetchOperators } from "../../data/refDataApi";
import { PageState } from "../../interfaces";
import { AddUserSchema, addUserSchema, OperatorData } from "../../schemas/add-user.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";

const title = "Add User - Create Transport Disruptions Service";
const description = "Add User page for the Create Transport Disruptions Service";

export interface AddUserPageProps extends PageState<Partial<AddUserSchema>> {
    operatorData?: OperatorData[];
}

const AddUser = (props: AddUserPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    return (
        <UserDetailPageTemplate
            pageType={"addUser"}
            title={title}
            description={description}
            pageState={pageState}
            setPageState={setPageState}
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
