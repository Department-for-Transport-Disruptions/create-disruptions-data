import { DisruptionInfo, OperatorConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    disruptionInfoSchema,
    operatorConsequenceSchema,
} from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { MiscellaneousReason, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { getPageState } from "./apiUtils";
import { getFutureDateAsString } from "./dates";
import { CD_DATE_FORMAT } from "../constants";
import { DEFAULT_ORG_ID } from "../testData/mockData";
import { splitCamelCaseToString } from ".";

describe("utils tests", () => {
    it.each([
        ["specialEvent", "Special event"],
        ["roadWorks", "Road works"],
        ["draft pending approval", "Draft pending approval"],
        ["", ""],
    ])("should convert text to sentence case", (text, formattedText) => {
        expect(splitCamelCaseToString(text)).toEqual(formattedText);
    });
});

describe("page state test", () => {
    it("should parse to expected type for DisruptionPageInputs", () => {
        const defaultDisruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const defaultDisruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const defaultPublishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);

        const disruptionData: DisruptionInfo = {
            disruptionId: randomUUID(),
            disruptionType: "unplanned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            associatedLink: "",
            disruptionReason: MiscellaneousReason.roadworks,
            publishStartDate: defaultPublishStartDate,
            publishStartTime: "1100",
            publishEndDate: "",
            publishEndTime: "",
            disruptionStartDate: defaultDisruptionStartDate,
            disruptionEndDate: defaultDisruptionEndDate,
            disruptionStartTime: "1000",
            disruptionEndTime: "1100",
            disruptionNoEndDateTime: "",
            displayId: "8fg3ha",
            orgId: DEFAULT_ORG_ID,
        };

        const parsedInput = getPageState("", disruptionInfoSchema, disruptionData.disruptionId, disruptionData);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(disruptionData);
    });

    it("should parse to expected type for ConsequenceOperatorPageInputs", () => {
        const operatorData: OperatorConsequence = {
            disruptionId: randomUUID(),
            consequenceIndex: 0,
            consequenceOperators: [{ operatorNoc: "FSYO", operatorPublicName: "Operator Name" }],
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            removeFromJourneyPlanners: "no",
            disruptionDelay: "",
            disruptionSeverity: Severity.slight,
            vehicleMode: VehicleMode.bus,
            consequenceType: "operatorWide",
        };

        const parsedInput = getPageState("", operatorConsequenceSchema, operatorData.disruptionId, operatorData);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(operatorData);
    });
});
