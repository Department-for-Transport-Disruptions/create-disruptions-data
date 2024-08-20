import { Severity } from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import { mockSessionWithOrgDetail } from "../../testData/mockData";
import CreateConsequenceStops, { CreateConsequenceStopsProps } from "./[disruptionId]/[consequenceIndex].page";

const blankInputs: CreateConsequenceStopsProps = {
    errors: [],
    inputs: {},
};

const withInputs: CreateConsequenceStopsProps = {
    errors: [],
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    inputs: {
        stops: [
            {
                atcoCode: "0100BRP90310",
                commonName: "Temple Meads Stn",
                indicator: "T3",
                latitude: 51.44901,
                longitude: -2.58569,
            },
            {
                atcoCode: "0100BRP90311",
                commonName: "Temple Meads Stn",
                indicator: "T7",
                latitude: 51.45014,
                longitude: -2.5856,
            },
        ],
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
    sessionWithOrg: mockSessionWithOrgDetail,
    disruptionDescription: "A truck broke down on a bridge",
};

const withInputsAndErrors: CreateConsequenceStopsProps = {
    errors: [
        { errorMessage: "Enter a description for this disruption", id: "description" },
        { errorMessage: "Select at least one option", id: "removeFromJourneyPlanners" },
    ],
    inputs: {
        stops: [
            {
                atcoCode: "0100BRP90310",
                commonName: "Temple Meads Stn",
                indicator: "T3",
                latitude: 51.44901,
                longitude: -2.58569,
            },
            {
                atcoCode: "0100BRP90311",
                commonName: "Temple Meads Stn",
                indicator: "T7",
                latitude: 51.45014,
                longitude: -2.5856,
            },
        ],
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
    sessionWithOrg: mockSessionWithOrgDetail,
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("pages", () => {
    describe("CreateConsequenceStops", () => {
        it("should render correctly with no inputs", () => {
            const { asFragment } = render(<CreateConsequenceStops {...blankInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const { asFragment } = render(<CreateConsequenceStops {...withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and showUnderground is true", () => {
            const { asFragment } = render(<CreateConsequenceStops {...{ ...withInputs, showUnderground: true }} />);

            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with errors and incorrect inputs", () => {
            const { asFragment } = render(<CreateConsequenceStops {...withInputsAndErrors} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: "/review-disruption" },
            }));
            const { asFragment } = render(<CreateConsequenceStops {...withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with appropriate buttons", () => {
            useRouter.mockImplementation(() => ({
                query: {
                    return: `${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
                },
            }));
            const { queryAllByText, unmount } = render(<CreateConsequenceStops {...withInputs} />);

            const cancelButton = queryAllByText("Cancel Changes");
            const deleteButton = queryAllByText("Delete disruption");
            const saveAsDraftButton = queryAllByText("Save as draft");

            expect(cancelButton).toBeTruthy();
            expect(deleteButton).toBeTruthy();
            expect(saveAsDraftButton).toBeTruthy();

            unmount();
        });
    });
});
