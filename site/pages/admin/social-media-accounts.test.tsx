import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import SocialMediaAccounts, { SocialMediaAccountsPageProps } from "./social-media-accounts.page";

const blankInputs: SocialMediaAccountsPageProps = {
    socialMediaData: [],
    username: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
    clientId: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
    isTestOrDev: true,
};

const withInputs: SocialMediaAccountsPageProps = {
    username: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
    clientId: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
    socialMediaData: [
        {
            id: "24858630",
            email: "testemail@gmail.com",
            fullName: "Test Person",
            accountType: "Hootsuite",
            addedBy: "Test Account",
            expiresIn: "Never",
            hootsuiteProfiles: [
                { type: "TWITTER", socialNetworkId: "1560718270506380122", id: "188295022" },
                { type: "FACEBOOK", socialNetworkId: "990838348810590", id: "138296272" },
            ],
        },
    ],
    isTestOrDev: true,
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
