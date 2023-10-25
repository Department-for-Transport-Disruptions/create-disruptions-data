import { render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AccountSettings from "./account-settings.page";
import { defaultModes } from "../schemas/organisation.schema";
import * as user from "../utils/user";

describe("accountSettings", () => {
    vi.mock("../utils/user", () => ({
        getDisruptionEmailPreference: vi.fn(),
    }));

    beforeEach(() => {
        getDisruptionEmailPreferenceSpy.mockResolvedValue(false);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    const getDisruptionEmailPreferenceSpy = vi.spyOn(user, "getDisruptionEmailPreference");
    it("should render correctly for organisation admin", () => {
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
                        isOrgPublisher: false,
                        isOrgStaff: false,
                        isSystemAdmin: false,
                        name: "Test User",
                        mode: defaultModes,
                    }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly and display the expected button for sysadmin", () => {
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

    it("should render correctly for staff or publisher user", () => {
        const tree = renderer
            .create(
                <AccountSettings
                    sessionWithOrg={{
                        email: "test@example.com",
                        username: "Test",
                        orgId: "org",
                        adminAreaCodes: [],
                        orgName: "Test Org",
                        isOrgAdmin: false,
                        isOrgPublisher: true,
                        isOrgStaff: true,
                        isSystemAdmin: false,
                        name: "Test User",
                        mode: defaultModes,
                    }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
