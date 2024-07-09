import renderer from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockSessionWithOrgDetail } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import ManageOrganisations, { ManageOrganisationsProps } from "./manage-organisations.page";

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

const getSessionWithOrgDetailSpy = vi.spyOn(session, "getSessionWithOrgDetail");

describe("manageOrganisations", () => {
    vi.mock("../../data/dynamo", () => ({
        getOrganisationsInfo: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    beforeEach(() => {
        getSessionWithOrgDetailSpy.mockResolvedValue(mockSessionWithOrgDetail);
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
