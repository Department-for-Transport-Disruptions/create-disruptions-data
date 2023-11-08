import renderer from "react-test-renderer";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import ManageOrganisations, { ManageOrganisationsProps } from "./manage-organisations.page";
import { defaultModes } from "../../schemas/organisation.schema";
import { SessionWithOrgDetail } from "../../schemas/session.schema";
import { DEFAULT_OPERATOR_ORG_ID } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

const blankInputs: ManageOrganisationsProps = {
    orgList: [],
};

const randomID = "016f954c-0e14-11ee-be56-0242ac120002";

const withInputs: ManageOrganisationsProps = {
    orgList: [
        {
            id: randomID,
            name: "KPMG",
            adminAreaCodes: ["001", "002"],
        },
        {
            id: randomID,
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
    isOperatorUser: false,
    orgId: randomID,
    username: "test@example.com",
    name: "Test User",
    orgName: "Nexus",
    adminAreaCodes: ["A", "B", "C"],
    mode: defaultModes,
    operatorOrgId: null,
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
