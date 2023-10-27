import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import UserDetailPageTemplate from "../../../components/page-templates/UserDetailPageTemplate";
import { COOKIES_EDIT_USER_ERRORS } from "../../../constants";
import { getGroupForUser, getUserDetails } from "../../../data/cognito";
import { PageState } from "../../../interfaces";
import { EditUserSchema, editUserSchema } from "../../../schemas/add-user.schema";
import { user } from "../../../schemas/user-management.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../../utils/apiUtils/auth";

const title = "Edit User - Create Transport Disruptions Service";
const description = "Edit User page for the Create Transport Disruptions Service";

export interface EditUserPageProps extends PageState<Partial<EditUserSchema>> {}

const EditUser = (props: EditUserPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    return (
        <UserDetailPageTemplate
            pageType={"editUser"}
            title={title}
            description={description}
            pageState={pageState}
            setPageState={setPageState}
            username={pageState.inputs.username}
            initialGroup={pageState.inputs.initialGroup}
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

    const userDetails = await getUserDetails(ctx.query.username.toString());
    const userGroup = await getGroupForUser(ctx.query.username.toString());
    const parsedUserInfo = user.safeParse({ ...userDetails, group: userGroup });

    if (!parsedUserInfo.success) {
        throw new Error("Unable to parse user data");
    }

    const editUserPageData = {
        givenName: parsedUserInfo.data.givenName,
        familyName: parsedUserInfo.data.familyName,
        email: parsedUserInfo.data.email,
        orgId: parsedUserInfo.data.orgId,
        group: parsedUserInfo.data.group,
        username: parsedUserInfo.data.username,
        initialGroup: parsedUserInfo.data.group,
    };

    const pageState = getPageState<EditUserSchema>(errorCookie, editUserSchema, undefined, editUserPageData);
    return {
        props: {
            ...pageState,
            sessionWithOrg: session,
        },
    };
};

export default EditUser;
