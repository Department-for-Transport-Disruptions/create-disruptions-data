import { Severity } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateConsequenceOperator, { CreateConsequenceOperatorProps } from "./[disruptionId]/[consequenceIndex].page";
import { mockOperators } from "../../testData/mockData";
import { ConsequenceOperators } from "../../schemas/consequence.schema";

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
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
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

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: "/review-disruption" },
            }));
            const tree = renderer.create(<CreateConsequenceOperator {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
