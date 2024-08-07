import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockSessionWithOrgDetail } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import SysAdminUserManagement, { SysAdminUserManagementProps } from "./users.page";

const blankInputs: SysAdminUserManagementProps = {
    inputs: {},
    errors: [],
};

const randomId = "016f954c-0e14-11ee-be56-0242ac120002";
const withInputs: SysAdminUserManagementProps = {
    inputs: {
        givenName: "dummy",
        familyName: "user",
        email: "dummy.user@gmail.com",
        group: UserGroups.orgAdmins,
    },
    errors: [],
    users: [
        {
            userStatus: "CONFIRMED",
            username: randomId,
            givenName: "dummy",
            familyName: "user1",
            email: "dummy.user1@gmail.com",
            organisation: randomId,
            group: UserGroups.orgAdmins,
            disruptionEmailPreference: "false",
            operatorOrgId: "N/A",
            streetManagerEmailPreference: "false",
        },
        {
            userStatus: "CONFIRMED",
            username: randomId,
            givenName: "dummy",
            familyName: "user2",
            email: "dummy.user2@gmail.com",
            organisation: randomId,
            group: UserGroups.orgAdmins,
            disruptionEmailPreference: "false",
            operatorOrgId: "N/A",
            streetManagerEmailPreference: "false",
        },
    ],
};

const getSessionWithOrgDetailSpy = vi.spyOn(session, "getSessionWithOrgDetail");

describe("addUser", () => {
    vi.mock("../../data/cognito", () => ({
        getUsersInGroupAndOrg: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const useRouter = vi.spyOn(require("next/router"), "useRouter");

    beforeEach(() => {
        getSessionWithOrgDetailSpy.mockResolvedValue(mockSessionWithOrgDetail);
        useRouter.mockImplementation(() => ({
            query: { orgId: randomId },
        }));
    });

    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<SysAdminUserManagement {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<SysAdminUserManagement {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
