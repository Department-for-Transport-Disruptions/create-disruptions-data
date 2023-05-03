import { ReactElement, useState } from "react";
import { BaseLayout } from "../components/layout/Layout";
import { PageState } from "../interfaces";
import { ChangePasswordProps, changePasswordSchema } from "../schemas/change-password.schema";
import { getStateUpdater } from "../utils/formUtils";
import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { getPageState } from "../utils/apiUtils";

const title = "Change Password - Create Transport Disruptions Service";
const description = "Change Password page for the Create Transport Disruptions Service";

export interface ChangePasswordPageProps extends PageState<Partial<ChangePasswordProps>> {}

const ChangePassword = (props: ChangePasswordPageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    return (
        <BaseLayout title={title} description={description} errors={pageState.errors}>
            <h1 className="govuk-heading-xl">Change password</h1>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: ChangePasswordPageProps } => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_CHANGE_PASSWORD_ERRORS];

    return {
        props: {
            ...getPageState(errorCookie, changePasswordSchema),
        },
    };
};

export default ChangePassword;
