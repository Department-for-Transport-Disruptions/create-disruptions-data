import { render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AccountSettings from "./account-settings.page";
import { mockSessionWithOrgDetail } from "../testData/mockData";
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
    it("should render correctly for org admin user", () => {
        const tree = renderer
            .create(
                <AccountSettings
                    sessionWithOrg={{ ...mockSessionWithOrgDetail, isOrgAdmin: true, isSystemAdmin: false }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly and display the expected button for sysadmin", () => {
        const { unmount } = render(<AccountSettings sessionWithOrg={mockSessionWithOrgDetail} />);

        const buttonElement = screen.getByText("Return to Manage Organisations");
        expect(buttonElement).toBeDefined();

        unmount();
    });

    it("should render correctly for staff or publisher user", () => {
        const tree = renderer
            .create(
                <AccountSettings
                    sessionWithOrg={{ ...mockSessionWithOrgDetail, isOrgStaff: true, isSystemAdmin: false }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
