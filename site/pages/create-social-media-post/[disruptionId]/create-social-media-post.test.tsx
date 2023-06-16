import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateSocialMediaPost from "./[socialMediaPostIndex].page";
import { SocialMediaPost } from "../../../schemas/social-media.schema";

const previousCreateSocialMediaPostInformation: SocialMediaPost = {
    disruptionId: "2",
    publishDate: "13/01/2022",
    publishTime: "1300",
    messageContent: "Test post 12345",
    socialAccount: "Twitter",
    hootsuiteProfile: "Twitter/1234",
    socialMediaPostIndex: 0,
    status: SocialMediaPostStatus.pending,
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
                        socialAccounts={[]}
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
