import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    DEFAULT_OPERATOR_ORG_ID,
    DEFAULT_ORG_ID,
    mockSessionWithOrgDetail,
    mockSessionWithOrgDetailAndShowUndergroundTrue,
} from "../testData/mockData";
import * as user from "../utils/user";
import AccountSettings from "./account-settings.page";

vi.mock("../utils/user", () => ({
    getEmailPreferences: vi.fn(),
}));

const getEmailPreferencesSpy = vi.spyOn(user, "getEmailPreferences");

beforeEach(() => {
    getEmailPreferencesSpy.mockResolvedValue({
        streetManagerEmailPreference: false,
        disruptionApprovalEmailPreference: false,
    });
});

afterEach(() => {
    vi.resetAllMocks();
    cleanup();
});

describe("accountSettings", () => {
    it("should render correctly for organisation admin", () => {
        const { asFragment } = render(<AccountSettings sessionWithOrg={mockSessionWithOrgDetail} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly for organisation admin and showUnderground is true", () => {
        const { asFragment } = render(
            <AccountSettings sessionWithOrg={mockSessionWithOrgDetailAndShowUndergroundTrue} />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly and display the expected button for sysadmin", () => {
        render(
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
    });

    it("should render correctly for staff user", () => {
        const { asFragment } = render(
            <AccountSettings
                sessionWithOrg={{
                    ...mockSessionWithOrgDetail,
                    isOrgAdmin: false,
                    isOrgStaff: true,
                }}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly for publisher user", () => {
        const { asFragment } = render(
            <AccountSettings
                sessionWithOrg={{
                    ...mockSessionWithOrgDetail,
                    isOrgAdmin: false,
                    isOrgPublisher: true,
                }}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly for operator", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
