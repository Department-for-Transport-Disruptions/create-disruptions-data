import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, afterEach, vi } from "vitest";
import UserManagement, { UserManagementPageProps } from "./user-management.page";

const blankInputs: UserManagementPageProps = {
    userList: [],
};

const withInputs: UserManagementPageProps = {
    userList: [
        {
            givenName: "dummmy",
            familyName: "user",
            email: "dummy.user@gmail.com",
            userStatus: "CONFIRMED",
            group: UserGroups.orgAdmins,
            organisation: "admin",
            username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
            disruptionEmailPreference: "false",
            operatorOrgId: "N/A",
            streetManagerEmailPreference: "false",
        },
    ],
};

describe("userManagement", () => {
    vi.mock("../../data/cognito", () => ({
        listUsersWithGroups: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<UserManagement {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<UserManagement {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
