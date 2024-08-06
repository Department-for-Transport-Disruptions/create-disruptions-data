import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { SocialMediaPost } from "../schemas/social-media.schema";
import ViewAllSocialMedia from "./view-all-social-media.page";

const mockPosts: SocialMediaPost[] = [
    {
        disruptionId: "2cf79629-5c9d-4bc2-8158-7ac68a9759e8",
        messageContent: "a post",
        socialAccount: "25858639",
        hootsuiteProfile: "138196022",
        publishDate: "28/06/2023",
        publishTime: "1700",
        socialMediaPostIndex: 0,
        status: SocialMediaPostStatus.successful,
        accountType: "Hootsuite",
    },
    {
        disruptionId: "2cf79629-5c9d-4bc2-8158-7ac68a9759e8",
        messageContent: "test 12345",
        socialAccount: "25858639",
        hootsuiteProfile: "138196022",
        publishDate: "28/06/2023",
        publishTime: "1800",
        socialMediaPostIndex: 3,
        image: {
            filepath: "/var/folders/85/5c4z0mfs49n56jgsyk737gf80000gp/T/ebe48640bd177bcf210246300",
            mimetype: "image/png",
            size: 70872,
            key: "242ff2b2-19a0-421f-976f-22905262ebda/75164cb7-0a66-420b-8fdc-184ff52cfa71/3.png",
            originalFilename: "1200px-SNice.svg.png",
            url: "https://cdd-image-bucket-teststage.s3.eu-west-2.amazonaws.com/12345",
        },
        status: SocialMediaPostStatus.successful,
        accountType: "Hootsuite",
    },
    {
        disruptionId: "5fb739a8-e5f3-4d3c-b828-f6557c23e834",
        messageContent: "oh no",
        socialAccount: "25858639",
        hootsuiteProfile: "138196022",
        publishDate: "04/07/2023",
        publishTime: "1900",
        socialMediaPostIndex: 0,
        image: {
            filepath: "/var/folders/85/5c4z0mfs49n56jgsyk737gf80000gp/T/d15e6c3b2c83ce2a733ee9701",
            mimetype: "image/png",
            size: 70872,
            key: "242ff2b2-19a0-421f-976f-22905262ebda/5fb739a8-e5f3-4d3c-b828-f6557c23e834/0.png",
            originalFilename: "1200px-SNice.svg.png",
            url: "https://cdd-image-bucket-teststage.s3.eu-west-2.amazonaws.com/12345",
        },
        status: SocialMediaPostStatus.successful,
        accountType: "Hootsuite",
    },
    {
        disruptionId: "640b8b7a-14b8-4f67-9cc3-7f5096a9403c",
        messageContent: "a post",
        socialAccount: "25858639",
        hootsuiteProfile: "138196022",
        publishDate: "28/06/2023",
        publishTime: "1700",
        socialMediaPostIndex: 0,
        status: SocialMediaPostStatus.rejected,
        accountType: "Hootsuite",
    },
    {
        disruptionId: "640b8b7a-14b8-4f67-9cc3-7f8156a9403c",
        messageContent: "twitter post",
        socialAccount: "25858639",
        socialMediaPostIndex: 1,
        status: SocialMediaPostStatus.successful,
        accountType: "Twitter",
    },
];

describe("ViewAllSocialMedia", () => {
    it("should render correctly when social media posts are present", () => {
        const { asFragment } = render(<ViewAllSocialMedia socialMediaPosts={mockPosts} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when social media posts are not present", () => {
        const { asFragment } = render(<ViewAllSocialMedia socialMediaPosts={[]} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
