import { ConsequenceOperators } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Severity } from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import renderer from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import { mockOperators } from "../../testData/mockData";
import CreateConsequenceOperator, { CreateConsequenceOperatorProps } from "./[disruptionId]/[consequenceIndex].page";

const blankInputs: CreateConsequenceOperatorProps = {
    errors: [],
    inputs: {},
    operators: mockOperators,
};

const defaultConsequenceOperators: ConsequenceOperators[] = [
    {
        operatorNoc: "FMAN",
        operatorPublicName: "Another operator",
    },
];

const withInputs: CreateConsequenceOperatorProps = {
    errors: [],
    inputs: {
        consequenceOperators: defaultConsequenceOperators,
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "yes",
        disruptionSeverity: Severity.severe,
    },
    operators: mockOperators,
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    disruptionDescription: "A truck broke down on a bridge",
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("pages", () => {
    describe("CreateConsequenceOperator", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateConsequenceOperator {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateConsequenceOperator {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs and showUnderground is true", () => {
            const tree = renderer
                .create(<CreateConsequenceOperator {...{ ...withInputs, showUnderground: true }} />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: "/review-disruption" },
            }));
            const tree = renderer.create(<CreateConsequenceOperator {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with appropriate buttons", () => {
            useRouter.mockImplementation(() => ({
                query: {
                    return: `${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
                },
            }));
            const { queryAllByText, unmount } = render(<CreateConsequenceOperator {...withInputs} />);

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
