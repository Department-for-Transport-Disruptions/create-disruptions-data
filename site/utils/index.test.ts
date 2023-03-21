import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect } from "vitest";
import { CD_DATE_FORMAT, Severity } from "../constants";
import { ConsequenceOperatorPageInputs } from "../pages/create-consequence-operator.page";
import { DisruptionPageInputs } from "../pages/create-disruption.page";
import { createConsequenceOperatorSchema } from "../schemas/create-consequence-operator.schema";
import { createDisruptionSchema } from "../schemas/create-disruption.schema";
import { getFutureDateAsString } from "./dates";
import { getPageStateFromCookies, splitCamelCaseToString } from ".";

describe("utils tests", () => {
    it.each([
        ["specialEvent", "Special event"],
        ["roadWorks", "Road works"],
        ["", ""],
    ])("should convert text to sentence case", (text, formattedText) => {
        expect(splitCamelCaseToString(text)).toEqual(formattedText);
    });
});

describe("page state from cookies test", () => {
    it("should parse to expected type for DisruptionPageInputs", () => {
        const defaultDisruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const defaultDisruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const defaultPublishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            disruptionType: "unplanned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            associatedLink: "",
            disruptionReason: MiscellaneousReason.roadWorks,
            publishStartDate: defaultPublishStartDate,
            publishStartTime: "1100",
            publishEndDate: "",
            publishEndTime: "",
            publishNoEndDateTime: "true",
            validity: [
                {
                    disruptionStartDate: defaultDisruptionStartDate,
                    disruptionEndDate: defaultDisruptionEndDate,
                    disruptionStartTime: "1000",
                    disruptionEndTime: "1100",
                    disruptionNoEndDateTime: "",
                },
            ],
        };

        const parsedInput = getPageStateFromCookies(JSON.stringify(disruptionData), "", createDisruptionSchema);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(disruptionData);
    });

    it("should parse to expected type for DisruptionPageInputs", () => {
        const operatorData: ConsequenceOperatorPageInputs = {
            consequenceOperator: "FMAN",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            removeFromJourneyPlanners: "no",
            disruptionDelay: "",
            disruptionSeverity: Severity.slight,
            disruptionDirection: "allDirections",
        };

        const parsedInput = getPageStateFromCookies(JSON.stringify(operatorData), "", createConsequenceOperatorSchema);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(operatorData);
    });
});
