import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import AccountSettings from "./account-settings.page";
import { Organisation } from "../schemas/organisation.schema";

const orgInfo: Organisation = {
    name: "dft-org-name",
    adminAreaCodes: ["001", "002"],
};

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
                    }}
                    orgInfo={orgInfo}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
