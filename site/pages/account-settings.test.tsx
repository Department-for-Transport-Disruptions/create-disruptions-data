import { render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import AccountSettings from "./account-settings.page";
import { defaultModes } from "../schemas/organisation.schema";

describe("accountSettings", () => {
    it("should render correctly", () => {
        const tree = renderer
            .create(
                <AccountSettings
                    sessionWithOrg={{
                        email: "test@example.com",
                        username: "Test",
                        orgId: "org",
                        adminAreaCodes: [],
                        orgName: "Test Org",
                        isOrgAdmin: true,
                        isOrgPublisher: true,
                        isOrgStaff: true,
                        isSystemAdmin: true,
                        name: "Test User",
                        mode: defaultModes,
                    }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly and display the expected button for sysadmin", async () => {
        const { unmount } = render(
            <AccountSettings
                sessionWithOrg={{
                    email: "test@example.com",
                    username: "Test",
                    orgId: "org",
                    adminAreaCodes: [],
                    orgName: "Test Org",
                    isOrgAdmin: false,
                    isOrgPublisher: false,
                    isOrgStaff: false,
                    isSystemAdmin: true,
                    name: "Test User",
                    mode: defaultModes,
                }}
            />,
        );

        const buttonElement = screen.getByText("Return to Manage Organisations");
        expect(buttonElement).toBeDefined();

        unmount();
    });
});
