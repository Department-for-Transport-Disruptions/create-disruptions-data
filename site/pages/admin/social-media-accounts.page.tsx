import { NextPageContext } from "next";
import Link from "next/link";
import { setCookie } from "nookies";
import { Fragment, ReactElement } from "react";
import { randomUUID } from "crypto";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import { COOKIES_HOOTSUITE_STATE, HOOTSUITE_API_BASE } from "../../constants";
import { getHootsuiteCreds } from "../../data/secrets";
import { SocialMediaAccountsSchema } from "../../schemas/social-media-accounts.schema";
import { getHootsuiteRedirectUri, toLowerStartCase } from "../../utils";

const title = "Social Media Accounts - Create Transport Disruptions Service";
const description = "Social Media Accounts page for the Create Transport Disruptions Service";

export interface SocialMediaAccountsPageProps {
    socialMediaData: SocialMediaAccountsSchema;
    hootsuiteRedirectUri: string;
    hootsuiteClientId: string;
    state: string;
}

const SocialMediaAccounts = ({
    socialMediaData,
    hootsuiteClientId,
    hootsuiteRedirectUri,
    state,
}: SocialMediaAccountsPageProps): ReactElement => {
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
                    href={`${HOOTSUITE_API_BASE}/oauth2/auth?response_type=code&scope=offline&redirect_uri=${hootsuiteRedirectUri}&client_id=${hootsuiteClientId}&state=${state}`}
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

    if (!process.env.HOOTSUITE_CREDS_ARN) {
        throw new Error("Hootsuite creds not available");
    }

    const hootsuiteCreds = await getHootsuiteCreds();

    const state = randomUUID();

    setCookie(ctx, COOKIES_HOOTSUITE_STATE, state);

    return {
        props: {
            socialMediaData: data,
            hootsuiteClientId: hootsuiteCreds?.clientId ?? "",
            hootsuiteRedirectUri: getHootsuiteRedirectUri(),
            state,
        },
    };
};

export default SocialMediaAccounts;
