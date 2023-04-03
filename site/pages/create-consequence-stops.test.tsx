import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceStops from "./create-consequence-stops.page";
import { PageState } from "../interfaces";
import { StopsConsequence } from "../schemas/consequence.schema";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";

const previousConsequenceInformation: ConsequenceType = {
    modeOfTransport: VehicleMode.ferryService,
    consequenceType: "stops",
};

const blankInputs: PageState<Partial<StopsConsequence>> = {
    errors: [],
    inputs: {},
};

const withInputs: PageState<Partial<StopsConsequence>> = {
    errors: [],
    inputs: {
        stops: [
            {
                atcoCode: "0100BRP90310",
                commonName: "Temple Meads Stn",
                indicator: "T3",
                latitude: "51.44901",
                longitude: "-2.58569",
            },
            {
                atcoCode: "0100BRP90311",
                commonName: "Temple Meads Stn",
                indicator: "T7",
                latitude: "51.45014",
                longitude: "-2.5856",
            },
        ],
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
};

const withInputsAndErrors: PageState<Partial<StopsConsequence>> = {
    errors: [
        { errorMessage: "Enter a description for this disruption", id: "description" },
        { errorMessage: "Select at least one option", id: "removeFromJourneyPlanners" },
    ],
    inputs: {
        stops: [
            {
                atcoCode: "0100BRP90310",
                commonName: "Temple Meads Stn",
                indicator: "T3",
                latitude: "51.44901",
                longitude: "-2.58569",
            },
            {
                atcoCode: "0100BRP90311",
                commonName: "Temple Meads Stn",
                indicator: "T7",
                latitude: "51.45014",
                longitude: "-2.5856",
            },
        ],
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
};

describe("pages", () => {
    describe("CreateConsequenceStops", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer
                .create(
                    <CreateConsequenceStops
                        initialPageState={blankInputs}
                        previousConsequenceInformation={previousConsequenceInformation}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer
                .create(
                    <CreateConsequenceStops
                        initialPageState={withInputs}
                        previousConsequenceInformation={previousConsequenceInformation}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with errors and incorrect inputs", () => {
            const tree = renderer
                .create(
                    <CreateConsequenceStops
                        initialPageState={withInputsAndErrors}
                        previousConsequenceInformation={previousConsequenceInformation}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
