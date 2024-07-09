import { Severity } from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import renderer from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import CreateConsequenceNetwork, { CreateConsequenceNetworkProps } from "./[disruptionId]/[consequenceIndex].page";

const blankInputs: CreateConsequenceNetworkProps = {
    errors: [],
    inputs: {},
};

const withInputs: CreateConsequenceNetworkProps = {
    errors: [],
    inputs: {
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "yes",
        disruptionSeverity: Severity.severe,
    },
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    disruptionDescription: "A truck broke down on a bridge",
};

const withInputsAndDisruptionaAreas: CreateConsequenceNetworkProps = {
    errors: [],
    inputs: {
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "yes",
        disruptionSeverity: Severity.severe,
        disruptionArea: ["082"],
    },
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    disruptionDescription: "A truck broke down on a bridge",
    disruptionAreas: [
        { name: "Test admin area", shortName: "Test", administrativeAreaCode: "082" },
        { name: "Test admin area 2", shortName: "Test 2", administrativeAreaCode: "099" },
        { name: "Test admin area 3", shortName: "Test 3", administrativeAreaCode: "147" },
    ],
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("pages", () => {
    describe("CreateConsequenceNetwork", () => {
        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateConsequenceNetwork {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs when stage is preprod/prod", () => {
            const tree = renderer
                .create(<CreateConsequenceNetwork {...{ ...withInputs, stage: "preprod" }} />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs & disruptionAreas", () => {
            const tree = renderer.create(<CreateConsequenceNetwork {...withInputsAndDisruptionaAreas} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs and showUnderground is true", () => {
            const tree = renderer
                .create(<CreateConsequenceNetwork {...{ ...withInputs, showUnderground: true }} />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateConsequenceNetwork {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: "/review-disruption" },
            }));
            const tree = renderer.create(<CreateConsequenceNetwork {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with appropriate buttons", () => {
            useRouter.mockImplementation(() => ({
                query: {
                    return: `${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
                },
            }));
            const { queryAllByText, unmount } = render(<CreateConsequenceNetwork {...withInputs} />);

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
