import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import { SocialMediaAccountsSchema } from "../../schemas/social-media-accounts.schema";
import { toLowerStartCase } from "../../utils/formUtils";

const title = "Social Media Accounts - Create Transport Disruptions Service";
const description = "Social Media Accounts page for the Create Transport Disruptions Service";

export interface SocialMediaAccountsPageProps {
    socialMediaData: SocialMediaAccountsSchema;
}

const SocialMediaAccounts = ({ socialMediaData }: SocialMediaAccountsPageProps): ReactElement => {
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
                    <>
                        <li className="list-none">
                            <Link
                                className="govuk-link text-govBlue"
                                key={`${toLowerStartCase(profile.type)}/${profile.id}`}
                                href={getLink(profile.type, profile.id)}
                            >
                                {`${toLowerStartCase(profile.type)}/${profile.id}`}
                            </Link>
                        </li>
                    </>
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
                <button className="govuk-button mt-8" data-module="govuk-button">
                    Connect hootsuite
                </button>
            </>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: SocialMediaAccountsPageProps } => {
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

    return {
        props: { socialMediaData: data },
    };
};

export default SocialMediaAccounts;
