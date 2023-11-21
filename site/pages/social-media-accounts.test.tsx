import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import SocialMediaAccounts, { SocialMediaAccountsPageProps } from "./social-media-accounts.page";

const blankInputs: SocialMediaAccountsPageProps = {
    socialMediaDetails: [],
    hootsuiteAuthUrl: "https://hootsuite-test-auth.com",
    twitterAuthUrl: "https://twitter-test-auth.com",
};

const withInputs: SocialMediaAccountsPageProps = {
    socialMediaDetails: [
        {
            id: "24858630",
            display: "testemail@gmail.com",
            accountType: "Hootsuite",
            addedBy: "Test Account",
            expiresIn: "Never",
            hootsuiteProfiles: [
                { type: "TWITTER", socialNetworkId: "1560718270506380122", id: "188295022" },
                { type: "FACEBOOK", socialNetworkId: "990838348810590", id: "138296272" },
            ],
        },
    ],
    hootsuiteAuthUrl: "https://hootsuite-test-auth.com",
    twitterAuthUrl: "https://twitter-test-auth.com",
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
