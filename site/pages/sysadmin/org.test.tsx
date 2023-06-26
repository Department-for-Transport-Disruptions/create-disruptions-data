import renderer from "react-test-renderer";
import { describe, it, expect, vi, afterEach } from "vitest";
import ManageOrgs, { ManageOrgProps } from "./org.page";
import { PageState } from "../../interfaces";

const blankInputs: PageState<Partial<ManageOrgProps>> = {
    inputs: {},
    errors: [],
};

const withInputs: PageState<Partial<ManageOrgProps>> = {
    inputs: {
        name: "test-org",
        adminAreaCodes: ["001", "002"],
        areaCodesDisplay: [
            {
                value: "001",
                label: "001",
            },
            {
                value: "002",
                label: "002",
            },
            {
                value: "003",
                label: "003",
            },
            {
                value: "004",
                label: "004",
            },
        ],
    },
    errors: [],
};
describe("manageOrgs", () => {
    vi.mock("../../data/dynamo", () => ({
        getOrganisationInfoById: vi.fn(),
    }));

    vi.mock("../../data/refDataApi", () => ({
        fetchAdminAreaCodes: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<ManageOrgs {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<ManageOrgs {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
