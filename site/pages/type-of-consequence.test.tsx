import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import TypeOfConsequence from "./type-of-consequence.page";
import { ConsequenceType, TransportMode } from "../constants/enum";
import { AddConsequenceProps, ErrorInfo } from "../interfaces/index";

const noErrors: ErrorInfo[] = [];
const withNoInputs: AddConsequenceProps = {};

const withErrors: ErrorInfo[] = [
    { id: "consequenceType", errorMessage: "Select a consequence type" },
    { id: "modeOfTransport", errorMessage: "Select a mode of transport" },
];
const withInputs: AddConsequenceProps = {
    modeOfTransport: TransportMode.bus,
    consequenceType: ConsequenceType.networkWide,
};

describe("pages", () => {
    describe("CreateDisruption", () => {
        it("should render correctly with no inputs and no errors", () => {
            const tree = renderer.create(<TypeOfConsequence errors={noErrors} inputs={withNoInputs} />).toJSON();
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
    });
});
