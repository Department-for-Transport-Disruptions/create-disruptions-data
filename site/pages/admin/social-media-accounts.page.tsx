import Link from "next/link";
import { ReactElement } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import { toLowerStartCase } from "../../utils/formUtils";

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
        return data.map((item) => ({
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

export default SocialMediaAccounts;
