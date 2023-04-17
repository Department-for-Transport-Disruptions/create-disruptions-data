import { Severity } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, beforeAll, vi } from "vitest";
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
};

beforeAll(() => {
    vi.mock("next/router", () => ({
        useRouter() {
            return {
                pathname: "",
                query: "",
            };
        },
    }));
});

describe("pages", () => {
    describe("CreateConsequenceNetwork", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateConsequenceNetwork {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateConsequenceNetwork {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
