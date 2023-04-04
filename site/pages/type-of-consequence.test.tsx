import { VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import TypeOfConsequence from "./type-of-consequence.page";
import { ErrorInfo } from "../interfaces/index";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";

const noErrors: ErrorInfo[] = [];

const withErrors: ErrorInfo[] = [
    { id: "consequenceType", errorMessage: "Select a consequence type" },
    { id: "modeOfTransport", errorMessage: "Select a mode of transport" },
];
const withInputs: ConsequenceType = {
    modeOfTransport: VehicleMode.bus,
    consequenceType: "networkWide",
};

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
    });
});
