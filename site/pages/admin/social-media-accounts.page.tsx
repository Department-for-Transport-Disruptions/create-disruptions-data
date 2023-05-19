import Link from "next/link";
import { ReactElement } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";

const title = "Social Media Accounts - Create Transport Disruptions Service";
const description = "Social Media Accounts page for the Create Transport Disruptions Service";

const SocialMediaAccounts = (): ReactElement => {
    const data = [
        {
            accountType: "Hootsuite",
            usernamePage: "ask@iverpoolcityregion-ca-gov.uk",
            addedBy: "Chris Cavanagh",
            expiresIn: "Never",
            hootsuiteProfiles: [
                { display: "Twitter/43308270", link: "https://twitter.com/43308270" },
                { display: "Twitter/29669438", link: "https://twitter.com/29669438" },
            ],
        },
        {
            accountType: "Hootsuite",
            usernamePage: "2ask@iverpoolcityregion-ca-gov.uk",
            addedBy: "Anna Simpson",
            expiresIn: "Never",
            hootsuiteProfiles: [{ display: "Twitter/43308888", link: "https://twitter.com/43308888" }],
        },
    ];

    const getRows = () => {
        return data.map((item) => ({
            cells: [
                ...Object.values(item)
                    .splice(0, Object.values(item).length - 1)
                    .map((value, i) => <p key={i}>{value as string}</p>),
                item.hootsuiteProfiles.map((profile) => (
                    <>
                        <li className="list-none">
                            <Link className="govuk-link text-govBlue" key={profile.display} href={profile.link}>
                                {profile.display}
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

export default SocialMediaAccounts;
