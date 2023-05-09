import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import AccountSettings from "./account-settings.page";

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
                    }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
