import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import { ErrorInfo } from "../../interfaces/index";
import { ConsequenceType } from "../../schemas/type-of-consequence.schema";
import TypeOfConsequence from "./[disruptionId]/[consequenceIndex].page";

const noErrors: ErrorInfo[] = [];

const withErrors: ErrorInfo[] = [
    { id: "consequenceType", errorMessage: "Select a consequence type" },
    { id: "vehicleMode", errorMessage: "Select a mode of transport" },
];
const withInputs: ConsequenceType = {
    disruptionId: "123",
    consequenceIndex: 0,
    consequenceType: "networkWide",
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("pages", () => {
    describe("CreateDisruption", () => {
        it("should render correctly with no inputs and no errors", () => {
            const { asFragment } = render(<TypeOfConsequence errors={noErrors} inputs={{}} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and with errors", () => {
            const { asFragment } = render(<TypeOfConsequence errors={withErrors} inputs={withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and without errors", () => {
            const { asFragment } = render(<TypeOfConsequence errors={noErrors} inputs={withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly for operator user with inputs and without errors", () => {
            const { asFragment } = render(
                <TypeOfConsequence errors={noErrors} inputs={withInputs} isOperatorUser={true} />,
            );
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: "/review-disruption" },
            }));
            const { asFragment } = render(<TypeOfConsequence errors={noErrors} inputs={withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with appropriate buttons", () => {
            useRouter.mockImplementation(() => ({
                query: {
                    return: `${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
                },
            }));
            const { queryAllByText, unmount } = render(<TypeOfConsequence errors={noErrors} inputs={withInputs} />);

            const cancelButton = queryAllByText("Cancel Changes");
            const deleteButton = queryAllByText("Delete disruption");

            expect(cancelButton).toBeTruthy();
            expect(deleteButton).toBeTruthy();

            unmount();
        });

        it("should render correctly if cancellations feature flag is set to true", () => {
            const { asFragment } = render(
                <TypeOfConsequence errors={noErrors} inputs={withInputs} enableCancellationsFeatureFlag={true} />,
            );

            expect(asFragment()).toMatchSnapshot();
        });
    });
});
