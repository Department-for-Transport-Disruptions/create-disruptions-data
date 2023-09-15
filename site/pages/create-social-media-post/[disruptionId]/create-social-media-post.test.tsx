import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateSocialMediaPost from "./[socialMediaPostIndex].page";
import { SocialMediaPost } from "../../../schemas/social-media.schema";

const previousCreateSocialMediaPostInformation: SocialMediaPost = {
    disruptionId: "f8d602b9-6e09-4fd7-b14b-deb1ca5b4f24",
    hootsuiteProfile: "127196025",
    image: {
        filepath: "/somefile/path",
        key: "e9f6962b-1e77-4d0b-9cr2-f123315fd14c/r8e603b8-6e08-4fd7-b12b-deb1ca5b4g23/1.png",
        mimetype: "image/png",
        originalFilename: "test-image.png",
        size: 70872,
    },
    messageContent: "Test post 12345",
    publishDate: "19/06/2023",
    publishTime: "1805",
    socialAccount: "13958638",
    socialMediaPostIndex: 0,
    status: SocialMediaPostStatus.successful,
    accountType: "Hootsuite",
};

describe("pages", () => {
    describe("CreateSocialMediaPost", () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const useRouter = vi.spyOn(require("next/router"), "useRouter");
        beforeEach(() => {
            useRouter.mockImplementation(() => ({
                query: "",
            }));
        });

        it("should render correctly with inputs and no errors", () => {
            const tree = renderer
                .create(
                    <CreateSocialMediaPost
                        disruptionSummary="test summary 123"
                        socialMediaPostIndex={0}
                        errors={[]}
                        inputs={previousCreateSocialMediaPostInformation}
                        socialAccounts={[
                            {
                                display: "testemail@gmail.com",
                                accountType: "Hootsuite",
                                hootsuiteProfiles: [
                                    {
                                        id: "138196022",
                                        socialNetworkId: "138196022",
                                        type: "TWITTER",
                                    },
                                    {
                                        id: "138196178",
                                        socialNetworkId: "138196178",
                                        type: "FACEBOOK",
                                    },
                                ],
                                addedBy: "Test User",
                                expiresIn: "Never",
                                id: "138196022",
                            },
                        ]}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with no inputs", () => {
            const tree = renderer
                .create(
                    <CreateSocialMediaPost
                        disruptionSummary="test summary 123"
                        socialMediaPostIndex={0}
                        errors={[]}
                        inputs={{}}
                        socialAccounts={[]}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
