import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import SocialMediaPost from "./[socialMediaPostIndex].page";
import { SocialMediaPost as SocialMedia } from "../../../schemas/social-media.schema";

const previousSocialMediaPostInformation: SocialMedia = {
    disruptionId: "2",
    publishDate: "13/01/2022",
    publishTime: "1300",
    messageContent: "Test post 12345",
    socialAccount: "Twitter",
    hootsuiteProfile: "Twitter/1234",
};

describe("pages", () => {
    describe("SocialMediaPost", () => {
        it("should render correctly with inputs and no errors", () => {
            const tree = renderer
                .create(
                    <SocialMediaPost
                        disruptionSummary="test summary 123"
                        socialMediaPostIndex={0}
                        errors={[]}
                        inputs={previousSocialMediaPostInformation}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with no inputs", () => {
            const tree = renderer
                .create(
                    <SocialMediaPost
                        disruptionSummary="test summary 123"
                        socialMediaPostIndex={0}
                        errors={[]}
                        inputs={{}}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
