import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import SocialMediaAccounts, { SocialMediaAccountsPageProps } from "./social-media-accounts.page";

const blankInputs: SocialMediaAccountsPageProps = {
    socialMediaData: [],
    username: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
    clientId: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
};

const withInputs: SocialMediaAccountsPageProps = {
    username: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
    clientId: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
    socialMediaData: [
        {
            id: "12345",
            accountType: "Hootsuite",
            email: "ask@iverpoolcityregion-ca-gov.uk",
            addedBy: "Chris Cavanagh",
            expiresIn: "Never",
            hootsuiteProfiles: [
                { type: "TWITTER", id: "43308270", socialNetworkId: "1234567" },
                { type: "TWITTER", id: "29669438", socialNetworkId: "1234567" },
            ],
        },
        {
            id: "12345",
            accountType: "Hootsuite",
            email: "2ask@iverpoolcityregion-ca-gov.uk",
            addedBy: "Anna Simpson",
            expiresIn: "Never",
            hootsuiteProfiles: [{ type: "TWITTER", id: "43308888", socialNetworkId: "1234567" }],
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
