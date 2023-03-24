import { VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";
import { ConsequenceStopsPageInputs } from "./create-consequence-stops.page";
import { PageState } from "../interfaces";

const previousConsequenceInformation: ConsequenceType = {
    modeOfTransport: VehicleMode.ferryService,
    consequenceType: "operatorWide",
};

const blankInputs: PageState<Partial<ConsequenceStopsPageInputs>> = {
    errors: [],
    inputs: {},
};

const withInputs: PageState<Partial<ConsequenceStopsPageInputs>> = {
    errors: [],
    inputs: {
        consequenceOperator: "FSYO",
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "yes",
        disruptionSeverity: Severity.severe,
        disruptionDirection: "allDirections",
    },
};
