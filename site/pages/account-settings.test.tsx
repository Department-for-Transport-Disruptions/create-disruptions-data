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
});
