import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import AdminUsers, { AdminUserProps } from "./users.page";
import { defaultModes } from "../../schemas/organisation.schema";
import { SessionWithOrgDetail } from "../../schemas/session.schema";
import * as session from "../../utils/apiUtils/auth";

const blankInputs: AdminUserProps = {
    inputs: {},
    errors: [],
};

const randomId = "016f954c-0e14-11ee-be56-0242ac120002";
const withInputs: AdminUserProps = {
    inputs: {
        givenName: "dummy",
        familyName: "user",
        email: "dummy.user@gmail.com",
        group: UserGroups.orgAdmins,
    },
    errors: [],
    admins: [
        {
            userStatus: "CONFIRMED",
            username: randomId,
            givenName: "dummy",
            familyName: "user1",
            email: "dummy.user1@gmail.com",
            organisation: randomId,
        },
        {
            userStatus: "CONFIRMED",
            username: randomId,
            givenName: "dummy",
            familyName: "user2",
            email: "dummy.user2@gmail.com",
            organisation: randomId,
        },
    ],
};

const defaultSession: SessionWithOrgDetail = {
    email: "test@example.com",
    isOrgAdmin: false,
    isOrgPublisher: false,
    isOrgStaff: false,
    isSystemAdmin: true,
    orgId: randomId,
    username: "test@example.com",
    name: "Test User",
    orgName: "Nexus",
    adminAreaCodes: ["A", "B", "C"],
    mode: defaultModes,
};

const getSessionWithOrgDetailSpy = vi.spyOn(session, "getSessionWithOrgDetail");

describe("addUser", () => {
    vi.mock("../../data/cognito", () => ({
        getUsersInGroupAndOrg: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const useRouter = vi.spyOn(require("next/router"), "useRouter");

    beforeEach(() => {
        getSessionWithOrgDetailSpy.mockResolvedValue(defaultSession);
        useRouter.mockImplementation(() => ({
            query: { orgId: randomId },
        }));
    });

    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<AdminUsers {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<AdminUsers {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
