import { NextPageContext } from "next";
import Link from "next/link";
import { Fragment, ReactElement } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import { SocialMediaAccountsSchema } from "../../schemas/social-media-accounts.schema";
import { toLowerStartCase } from "../../utils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";
import { putParameter } from "../../data/ssm";
import { parseCookies } from "nookies";
import { COOKIES_ID_TOKEN, COOKIES_REFRESH_TOKEN } from "../../constants";
import { SessionWithOrgDetail } from "../../schemas/session.schema";

const title = "Social Media Accounts - Create Transport Disruptions Service";
const description = "Social Media Accounts page for the Create Transport Disruptions Service";

export interface SocialMediaAccountsPageProps {
    socialMediaData: SocialMediaAccountsSchema;
    session: SessionWithOrgDetail;
}

const SocialMediaAccounts = ({ socialMediaData, session }: SocialMediaAccountsPageProps): ReactElement => {
    console.log("username--------", session.username);
    const getLink = (type: string, id: string) => {
        switch (type) {
            case "TWITTER":
                return `https://twitter.com/${id}/`;
            case "FACEBOOK":
                return `https://facebook.com/${id}/`;
            default:
                return "";
        }
    };

    const getRows = () => {
        return socialMediaData.map((item) => ({
            cells: [
                ...Object.values(item)
                    .splice(0, Object.values(item).length - 1)
                    .map((value, i) => <p key={i}>{value as string}</p>),
                item.hootsuiteProfiles.map((profile) => (
                    <Fragment key={profile.id}>
                        <li className="list-none">
                            <Link
                                className="govuk-link text-govBlue"
                                key={`${toLowerStartCase(profile.type)}/${profile.id}`}
                                href={getLink(profile.type, profile.id)}
                            >
                                {`${toLowerStartCase(profile.type)}/${profile.id}`}
                            </Link>
                        </li>
                    </Fragment>
                )),
            ],
        }));
    };

    return (
        <BaseLayout title={title} description={description}>
            <>
                <h1 className="govuk-heading-xl">Social media accounts</h1>
                <Table
                    columns={["Account type", "Username/page", "Added by", "Expires in", "Hootsuite Profiles"]}
                    rows={getRows()}
                />
                <Link
                    className="govuk-button mt-8"
                    data-module="govuk-button"
                    href={`https://platform.hootsuite.com/oauth2/auth?response_type=code&scope=offline&redirect_uri=http://localhost:3000/api/hootsuite-callback`}
                >
                    Connect hootsuite
                </Link>
            </>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: SocialMediaAccountsPageProps }> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        throw new Error("Session data not found");
    }

    const cookies = parseCookies(ctx);
    const idToken = cookies[COOKIES_ID_TOKEN];
    const refreshToken = cookies[COOKIES_REFRESH_TOKEN];

    if (idToken && refreshToken)
        await Promise.all([
            putParameter(`/${session.username}/token`, idToken, "SecureString", true),
            putParameter(`/${session.username}/refresh-token`, refreshToken, "SecureString", true),
        ]);

    const data = [
        {
            accountType: "Hootsuite",
            usernamePage: "ask@iverpoolcityregion-ca-gov.uk",
            addedBy: "Chris Cavanagh",
            expiresIn: "Never",
            hootsuiteProfiles: [
                { type: "TWITTER", id: "43308270" },
                { type: "TWITTER", id: "29669438" },
            ],
        },
        {
            accountType: "Hootsuite",
            usernamePage: "2ask@iverpoolcityregion-ca-gov.uk",
            addedBy: "Anna Simpson",
            expiresIn: "Never",
            hootsuiteProfiles: [{ type: "TWITTER", id: "43308888" }],
        },
    ];

    return {
        props: { socialMediaData: data, session: session },
    };
};

export default SocialMediaAccounts;
