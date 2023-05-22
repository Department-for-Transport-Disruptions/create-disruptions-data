import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import SocialMediaAccounts, { SocialMediaAccountsPageProps } from "./social-media-accounts.page";

const blankInputs: SocialMediaAccountsPageProps = {
    socialMediaData: [],
};

const withInputs: SocialMediaAccountsPageProps = {
    socialMediaData: [
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
    ],
};

describe("socialMediaAccounts", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<SocialMediaAccounts {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<SocialMediaAccounts {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
