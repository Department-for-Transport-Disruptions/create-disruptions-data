import { render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import AccountSettings from "./account-settings.page";
import { mockSessionWithOrgDetail } from "../testData/mockData";

describe("accountSettings", () => {
    it("should render correctly", () => {
        const tree = renderer
            .create(<AccountSettings sessionWithOrg={{ ...mockSessionWithOrgDetail, isOrgStaff: true }} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly for org admin user", () => {
        const tree = renderer
            .create(<AccountSettings sessionWithOrg={{ ...mockSessionWithOrgDetail, isOrgAdmin: true }} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly and display the expected button for sysadmin", () => {
        const { unmount } = render(<AccountSettings sessionWithOrg={mockSessionWithOrgDetail} />);

        const buttonElement = screen.getByText("Return to Manage Organisations");
        expect(buttonElement).toBeDefined();

        unmount();
    });
});
