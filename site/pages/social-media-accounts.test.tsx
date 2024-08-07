import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SocialMediaAccounts, { SocialMediaAccountsPageProps } from "./social-media-accounts.page";

const blankInputs: SocialMediaAccountsPageProps = {
    socialMediaDetails: [],
    hootsuiteAuthUrl: "https://hootsuite-test-auth.com",
    twitterAuthUrl: "https://twitter-test-auth.com",
    nextdoorAuthUrl: "https://nextdoor-test-auth.com",
    errors: [],
    isOperator: false,
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
                {
                    type: "TWITTER",
                    socialNetworkId: "1560718270506380122",
                    id: "188295022",
                    socialNetworkUsername: null,
                },
                {
                    type: "FACEBOOK",
                    socialNetworkId: "990838348810590",
                    id: "138296272",
                    socialNetworkUsername: "Test Account",
                },
            ],
        },
    ],
    hootsuiteAuthUrl: "https://hootsuite-test-auth.com",
    twitterAuthUrl: "https://twitter-test-auth.com",
    nextdoorAuthUrl: "https://nextdoor-test-auth.com",
    errors: [],
    isOperator: false,
};

describe("SocialMediaAccounts", () => {
    it("should render correctly when there are no inputs", () => {
        const { asFragment } = render(<SocialMediaAccounts {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const { asFragment } = render(<SocialMediaAccounts {...withInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs and an error", () => {
        const { asFragment } = render(
            <SocialMediaAccounts
                {...{
                    ...withInputs,
                    errors: [{ id: "nextdoor", errorMessage: "Only agency accounts can be connected" }],
                }}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should not show the nextdoor button when there is an operator user", () => {
        const { asFragment } = render(
            <SocialMediaAccounts
                {...{
                    ...withInputs,
                    isOperator: true,
                }}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
