import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import CreateDisruption, { DisruptionPageProps } from "./[disruptionId].page";

const blankInputs: DisruptionPageProps = {
    errors: [],
    inputs: {},
};

const withInputs: DisruptionPageProps = {
    errors: [],
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    inputs: {
        disruptionType: "planned",
        summary: "New disruption",
        description: "A truck broke the bridge",
        associatedLink: "www.bbc.com",
        disruptionReason: MiscellaneousReason.routeDiversion,
        validity: [
            {
                disruptionStartDate: "01/04/2023",
                disruptionEndDate: "03/04/2023",
                disruptionStartTime: "0100",
                disruptionEndTime: "0200",
                disruptionNoEndDateTime: "",
            },
        ],
        disruptionStartDate: "10/03/2023",
        disruptionEndDate: "13/03/2023",
        disruptionStartTime: "0100",
        disruptionEndTime: "0200",
        disruptionNoEndDateTime: "",
        disruptionRepeats: "weekly",
        disruptionRepeatsEndDate: "30/03/2023",
        publishStartDate: "01/03/2023",
        publishEndDate: "01/08/2023",
        publishStartTime: "0200",
        publishEndTime: "2300",
    },
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("pages", () => {
    describe("CreateDisruption", () => {
        it("should render correctly with no inputs", () => {
            const { asFragment } = render(<CreateDisruption {...blankInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const { asFragment } = render(<CreateDisruption {...withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: REVIEW_DISRUPTION_PAGE_PATH },
            }));
            const { asFragment } = render(<CreateDisruption {...withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with appropriate text when redirected from template overview", () => {
            useRouter.mockImplementation(() => ({
                query: {
                    return: `${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
                },
            }));
            const { queryAllByText, unmount } = render(<CreateDisruption {...withInputs} />);

            const heading = queryAllByText("Create a new disruption from template");
            const cancelButton = queryAllByText("Cancel Changes");
            const deleteButton = queryAllByText("Delete disruption");

            expect(heading).toBeTruthy();
            expect(cancelButton).toBeTruthy();
            expect(deleteButton).toBeTruthy();
            unmount();
        });
    });
});
