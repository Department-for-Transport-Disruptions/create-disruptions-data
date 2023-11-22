import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TypeOfConsequence from "./[disruptionId]/[consequenceIndex].page";
import { ErrorInfo } from "../../interfaces/index";
import { ConsequenceType } from "../../schemas/type-of-consequence.schema";

const noErrors: ErrorInfo[] = [];

const withErrors: ErrorInfo[] = [
    { id: "consequenceType", errorMessage: "Select a consequence type" },
    { id: "vehicleMode", errorMessage: "Select a mode of transport" },
];
const withInputs: ConsequenceType = {
    disruptionId: "123",
    consequenceIndex: 0,
    consequenceType: "networkWide",
    disruptionStatus: PublishStatus.published,
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("pages", () => {
    describe("CreateDisruption", () => {
        it("should render correctly with no inputs and no errors", () => {
            const tree = renderer.create(<TypeOfConsequence errors={noErrors} inputs={{}} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs and with errors", () => {
            const tree = renderer.create(<TypeOfConsequence errors={withErrors} inputs={withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs and without errors", () => {
            const tree = renderer.create(<TypeOfConsequence errors={noErrors} inputs={withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly for operator user with inputs and without errors", () => {
            const tree = renderer
                .create(<TypeOfConsequence errors={noErrors} inputs={withInputs} isOperatorUser={true} />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            const tree = renderer.create(<TypeOfConsequence errors={noErrors} inputs={withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with appropriate buttons", () => {
            const { queryAllByText, unmount } = render(<TypeOfConsequence errors={noErrors} inputs={withInputs} />);

            const cancelButton = queryAllByText("Cancel Changes");
            const deleteButton = queryAllByText("Delete disruption");

            expect(cancelButton).toBeTruthy();
            expect(deleteButton).toBeTruthy();

            unmount();
        });
    });
});
