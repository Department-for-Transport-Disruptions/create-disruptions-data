import { Severity } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
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
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    });
});
