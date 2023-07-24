import { NextPageContext } from "next";
import { BaseLayout } from "../components/layout/Layout";

const title = "Reset password confirmation - Create Transport Disruptions Service";
const description = "Password reset confirmation page for the Create Transport Disruptions Service";

export interface ResetPasswordConfirmationProps {
    email: string;
}
const ResetPasswordConfirmation = ({ email }: ResetPasswordConfirmationProps) => {
    const text = `If this email address exists in our system we will have sent a password reset email to ${email}. Check your email and follow the link within 24 hours to reset your password`;
    return (
        <BaseLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">Reset password link has been sent</h1>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <p className="govuk-body-m">{text}</p>
                    <br />
                    <p className="govuk-body-m">
                        If you cannot find the email then look in your spam or junk email folder.
                    </p>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext) => {
    const email = ctx.query.email;

    return {
        props: {
            email: email || "",
        },
    };
};

export default ResetPasswordConfirmation;
