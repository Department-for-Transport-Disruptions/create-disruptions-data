import renderer from "react-test-renderer";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { randomUUID } from "crypto";
import ManageOrganisations, { ManageOrganisationsProps } from "./manage-organisations.page";
import { SessionWithOrgDetail } from "../../schemas/session.schema";
import * as session from "../../utils/apiUtils/auth";

const blankInputs: ManageOrganisationsProps = {
    orgList: [],
};

const withInputs: ManageOrganisationsProps = {
    orgList: [
        {
            PK: randomUUID(),
            name: "KPMG",
            adminAreaCodes: ["001", "002"],
        },
        {
            PK: randomUUID(),
            name: "KPMG UK",
            adminAreaCodes: ["003", "004"],
        },
    ],
};

const defaultSession: SessionWithOrgDetail = {
    email: "test@example.com",
    isOrgAdmin: false,
    isOrgPublisher: false,
    isOrgStaff: false,
    isSystemAdmin: true,
    orgId: randomUUID(),
    username: "test@example.com",
    name: "Test User",
    orgName: "Nexus",
    adminAreaCodes: ["A", "B", "C"],
};

const getSessionWithOrgDetailSpy = vi.spyOn(session, "getSessionWithOrgDetail");

describe("manageOrganisations", () => {
    vi.mock("../../data/dynamo", () => ({
        getOrganisationsInfo: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    beforeEach(() => {
        getSessionWithOrgDetailSpy.mockResolvedValue(defaultSession);
    });

    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<ManageOrganisations {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<ManageOrganisations {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
