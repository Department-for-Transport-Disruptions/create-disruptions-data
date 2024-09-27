import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SocialMediaPost } from "../../../schemas/social-media.schema";
import CreateSocialMediaPost from "./[socialMediaPostIndex].page";

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

afterEach(cleanup);

describe("pages", () => {
    describe("CreateSocialMediaPost", () => {
        const useRouter = vi.spyOn(require("next/router"), "useRouter");
        beforeEach(() => {
            useRouter.mockImplementation(() => ({
                query: "",
            }));
        });

        it("should render correctly with inputs and no errors", () => {
            const { asFragment } = render(
                <CreateSocialMediaPost
                    agencyBoundaries={[
                        {
                            nextdoorUserId: "985654341",
                            boundaries: [
                                { name: "Test Area 1", groupId: 1234, type: "boundary", geometryId: 1234 },
                                { name: "Test Area 2", groupId: 1264, type: "boundary", geometryId: 12345 },
                            ],
                        },
                    ]}
                    disruptionDescription="test summary 123"
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
                                    socialNetworkUsername: null,
                                },
                                {
                                    id: "138196178",
                                    socialNetworkId: "138196178",
                                    type: "FACEBOOK",
                                    socialNetworkUsername: "Test Account",
                                },
                            ],
                            addedBy: "Test User",
                            expiresIn: "Never",
                            id: "138196022",
                        },
                        {
                            display: "nextdoor@example.com",
                            accountType: "Nextdoor",
                            addedBy: "Test User",
                            expiresIn: "Never",
                            id: "985654341",
                            groupIds: [
                                { name: "Test Area 1", groupId: 1234 },
                                { name: "Test Area 2", groupId: 1264 },
                            ],
                        },
                    ]}
                />,
            );

            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with no inputs", () => {
            const { asFragment } = render(
                <CreateSocialMediaPost
                    agencyBoundaries={[]}
                    disruptionDescription="test summary 123"
                    socialMediaPostIndex={0}
                    errors={[]}
                    inputs={{}}
                    socialAccounts={[]}
                />,
            );

            expect(asFragment()).toMatchSnapshot();
        });

        it("should only show message content input when twitter account selected", async () => {
            const { unmount, getByLabelText, queryAllByLabelText } = render(
                <CreateSocialMediaPost
                    agencyBoundaries={[
                        {
                            nextdoorUserId: "985654341",
                            boundaries: [
                                { name: "Test Area 1", groupId: 1234, type: "boundary", geometryId: 1234 },
                                { name: "Test Area 2", groupId: 1264, type: "boundary", geometryId: 12345 },
                            ],
                        },
                    ]}
                    disruptionDescription="test summary 123"
                    socialMediaPostIndex={0}
                    errors={[]}
                    inputs={previousCreateSocialMediaPostInformation}
                    socialAccounts={[
                        {
                            display: "hootsuite@example.com",
                            accountType: "Hootsuite",
                            hootsuiteProfiles: [
                                {
                                    id: "138196022",
                                    socialNetworkId: "138196022",
                                    type: "TWITTER",
                                    socialNetworkUsername: null,
                                },
                                {
                                    id: "138196178",
                                    socialNetworkId: "138196178",
                                    type: "FACEBOOK",
                                    socialNetworkUsername: "Test Account",
                                },
                            ],
                            addedBy: "Test User",
                            expiresIn: "Never",
                            id: "138196022",
                        },
                        {
                            display: "twitter@example.com",
                            accountType: "Twitter",
                            addedBy: "Test User",
                            expiresIn: "Never",
                            id: "987654321",
                        },
                        {
                            display: "nextdoor@example.com",
                            accountType: "Nextdoor",
                            addedBy: "Test User",
                            expiresIn: "Never",
                            id: "985654341",
                            groupIds: [
                                { name: "Test Area 1", groupId: 1234 },
                                { name: "Test Area 2", groupId: 1264 },
                            ],
                        },
                    ]}
                />,
            );

            await userEvent.selectOptions(getByLabelText("Select social media account"), "987654321");

            expect(queryAllByLabelText("Select Hootsuite profile").length).toBe(0);
            expect(queryAllByLabelText("Date").length).toBe(0);
            expect(queryAllByLabelText("Time").length).toBe(0);

            unmount();
        });

        it("should show all fields when hootsuite account selected", async () => {
            const { unmount, getByLabelText, queryAllByLabelText } = render(
                <CreateSocialMediaPost
                    agencyBoundaries={[
                        {
                            nextdoorUserId: "985654341",
                            boundaries: [
                                { name: "Test Area 1", groupId: 1234, type: "boundary", geometryId: 1234 },
                                { name: "Test Area 2", groupId: 1264, type: "boundary", geometryId: 12345 },
                            ],
                        },
                    ]}
                    disruptionDescription="test summary 123"
                    socialMediaPostIndex={0}
                    errors={[]}
                    inputs={previousCreateSocialMediaPostInformation}
                    socialAccounts={[
                        {
                            display: "hootsuite@example.com",
                            accountType: "Hootsuite",
                            hootsuiteProfiles: [
                                {
                                    id: "138196022",
                                    socialNetworkId: "138196022",
                                    type: "TWITTER",
                                    socialNetworkUsername: null,
                                },
                                {
                                    id: "138196178",
                                    socialNetworkId: "138196178",
                                    type: "FACEBOOK",
                                    socialNetworkUsername: "Test Account",
                                },
                            ],
                            addedBy: "Test User",
                            expiresIn: "Never",
                            id: "138196022",
                        },
                        {
                            display: "twitter@example.com",
                            accountType: "Twitter",
                            addedBy: "Test User",
                            expiresIn: "Never",
                            id: "987654321",
                        },
                        {
                            display: "nextdoor@example.com",
                            accountType: "Nextdoor",
                            addedBy: "Test User",
                            expiresIn: "Never",
                            id: "985654341",
                            groupIds: [
                                { name: "Test Area 1", groupId: 1234 },
                                { name: "Test Area 2", groupId: 1264 },
                            ],
                        },
                    ]}
                />,
            );

            await userEvent.selectOptions(getByLabelText("Select social media account"), "138196022");

            expect(queryAllByLabelText("Select Hootsuite profile").length).toBe(1);
            expect(queryAllByLabelText("Date").length).toBe(1);
            expect(queryAllByLabelText("Time").length).toBe(1);

            unmount();
        });
    });

    it("should show all fields when nextdoor account selected", async () => {
        const { unmount, getByLabelText, queryAllByLabelText } = render(
            <CreateSocialMediaPost
                agencyBoundaries={[
                    {
                        nextdoorUserId: "985654341",
                        boundaries: [
                            { name: "Test Area 1", groupId: 1234, type: "boundary", geometryId: 1234 },
                            { name: "Test Area 2", groupId: 1264, type: "boundary", geometryId: 12345 },
                        ],
                    },
                ]}
                disruptionDescription="test summary 123"
                socialMediaPostIndex={0}
                errors={[]}
                inputs={previousCreateSocialMediaPostInformation}
                socialAccounts={[
                    {
                        display: "hootsuite@example.com",
                        accountType: "Hootsuite",
                        hootsuiteProfiles: [
                            {
                                id: "138196022",
                                socialNetworkId: "138196022",
                                type: "TWITTER",
                                socialNetworkUsername: null,
                            },
                            {
                                id: "138196178",
                                socialNetworkId: "138196178",
                                type: "FACEBOOK",
                                socialNetworkUsername: "Test Account",
                            },
                        ],
                        addedBy: "Test User",
                        expiresIn: "Never",
                        id: "138196022",
                    },
                    {
                        display: "twitter@example.com",
                        accountType: "Twitter",
                        addedBy: "Test User",
                        expiresIn: "Never",
                        id: "987654321",
                    },
                    {
                        display: "nextdoor@example.com",
                        accountType: "Nextdoor",
                        addedBy: "Test User",
                        expiresIn: "Never",
                        id: "985654341",
                        groupIds: [
                            { name: "Test Area 1", groupId: 1234 },
                            { name: "Test Area 2", groupId: 1264 },
                        ],
                    },
                ]}
            />,
        );

        await userEvent.selectOptions(getByLabelText("Select social media account"), "985654341");

        expect(queryAllByLabelText("Area boundaries").length).toBe(1);

        unmount();
    });
});
