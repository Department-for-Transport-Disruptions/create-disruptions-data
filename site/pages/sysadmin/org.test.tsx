import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageState } from "../../interfaces";
import ManageOrgs, { ManageOrgProps } from "./org.page";

const blankInputs: PageState<Partial<ManageOrgProps>> = {
    inputs: {},
    errors: [],
};

const withInputs: PageState<Partial<ManageOrgProps>> = {
    inputs: {
        name: "test-org",
        adminAreas: [
            { administrativeAreaCode: "001", name: "Area 1", shortName: "A1" },
            { administrativeAreaCode: "002", name: "Area 2", shortName: "A2" },
            { administrativeAreaCode: "051", name: "Area 51", shortName: "A51" },
        ],
        orgAdminAreas: [
            { administrativeAreaCode: "001", name: "Area 1", shortName: "A1" },
            { administrativeAreaCode: "002", name: "Area 2", shortName: "A2" },
        ],
    },
    errors: [],
};

describe("ManageOrgs", () => {
    vi.mock("../../data/dynamo", () => ({
        getOrganisationInfoById: vi.fn(),
    }));

    vi.mock("@create-disruptions-data/shared-ts/utils/refDataApi", () => ({
        fetchAdminAreaCodes: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
        cleanup();
    });

    it("should render correctly when there are no inputs", () => {
        const { asFragment } = render(<ManageOrgs {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const { asFragment } = render(<ManageOrgs {...withInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should add admin area to list when selected", async () => {
        const { unmount, getByLabelText, getByText, getAllByRole } = render(<ManageOrgs {...withInputs} />);

        await userEvent.click(getByLabelText("NaPTAN AdminArea"));
        await userEvent.click(getByText("051 - Area 51"));

        const expectedRow = getAllByRole("row")[3];

        expect(expectedRow.innerHTML).toContain("051 - Area 51");

        unmount();
    });
});
