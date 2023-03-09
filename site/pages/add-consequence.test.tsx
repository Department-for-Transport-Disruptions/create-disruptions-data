import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import AddConsequence, { AddConsequenceProps, TransportMode, ConsequenceType } from "./add-consequence";
import { ErrorInfo } from "../interfaces/index";

const noErrors: ErrorInfo[] = [];
const withNoInputs: AddConsequenceProps = {};

const withErrors: ErrorInfo[] = [
    { id: "consequence-type-services", errorMessage: "Please select a consequence type" },
    { id: "transport-mode-bus", errorMessage: "Please select a mode of transport" },
];
const withInputs: AddConsequenceProps = {
    modeOfTransport: TransportMode.bus,
    consequenceType: ConsequenceType.networkWide,
};

describe("pages", () => {
    describe("CreateDisruption", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<AddConsequence errors={noErrors} inputs={withNoInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<AddConsequence errors={withErrors} inputs={withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
