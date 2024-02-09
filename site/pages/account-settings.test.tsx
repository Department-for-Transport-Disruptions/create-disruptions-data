import { render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AccountSettings from "./account-settings.page";
import { DEFAULT_OPERATOR_ORG_ID, DEFAULT_ORG_ID, mockSessionWithOrgDetail } from "../testData/mockData";
import * as user from "../utils/user";

describe("accountSettings", () => {
    vi.mock("../utils/user", () => ({
        getEmailPreferences: vi.fn(),
    }));

    beforeEach(() => {
        getEmailPreferencesSpy.mockResolvedValue({
            streetManagerEmailPreference: false,
            disruptionApprovalEmailPreference: false,
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    const getEmailPreferencesSpy = vi.spyOn(user, "getEmailPreferences");
    it("should render correctly for organisation admin", () => {
        const tree = renderer.create(<AccountSettings sessionWithOrg={mockSessionWithOrgDetail} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly and display the expected button for sysadmin", () => {
        const { unmount } = render(
            <AccountSettings
                sessionWithOrg={{
                    ...mockSessionWithOrgDetail,
                    isOrgAdmin: false,
                    isSystemAdmin: true,
                }}
            />,
        );

        const buttonElement = screen.getByText("Return to Manage Organisations");
        expect(buttonElement).toBeDefined();

        unmount();
    });

    it("should render correctly for staff user", () => {
        const tree = renderer
            .create(
                <AccountSettings
                    sessionWithOrg={{
                        ...mockSessionWithOrgDetail,
                        isOrgAdmin: false,
                        isOrgStaff: true,
                    }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly for publisher user", () => {
        const tree = renderer
            .create(
                <AccountSettings
                    sessionWithOrg={{
                        ...mockSessionWithOrgDetail,
                        isOrgAdmin: false,
                        isOrgPublisher: true,
                    }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly for operator", () => {
        const tree = renderer
            .create(
                <AccountSettings
                    sessionWithOrg={{
                        ...mockSessionWithOrgDetail,
                        isOrgAdmin: false,
                        isOperatorUser: true,
                        operatorOrgId: DEFAULT_OPERATOR_ORG_ID,
                    }}
                    operator={{
                        nocCodes: ["WRAY", "CPTR", "MOXN"],
                        operatorOrgId: DEFAULT_OPERATOR_ORG_ID,
                        orgId: DEFAULT_ORG_ID,
                        name: "add-op",
                    }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
