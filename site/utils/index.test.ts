import { MiscellaneousReason, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { getPageState } from "./apiUtils";
import { getFutureDateAsString } from "./dates";
import { CD_DATE_FORMAT } from "../constants";
import { OperatorConsequence, operatorConsequenceSchema } from "../schemas/consequence.schema";
import { createDisruptionSchema, DisruptionInfo } from "../schemas/create-disruption.schema";
import { Disruption } from "../schemas/disruption.schema";
import { disruptionInfoTest } from "../testData/mockData";
import { sortDisruptionsByStartDate, splitCamelCaseToString } from ".";

describe("utils tests", () => {
    it.each([
        ["specialEvent", "Special event"],
        ["roadWorks", "Road works"],
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
        };

        const parsedInput = getPageState("", createDisruptionSchema, disruptionData.disruptionId, disruptionData);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(disruptionData);
    });

    it("should parse to expected type for ConsequenceOperatorPageInputs", () => {
        const operatorData: OperatorConsequence = {
            disruptionId: randomUUID(),
            consequenceIndex: 0,
            consequenceOperator: "FMAN",
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

describe("sortDisruptionsByStartDate", () => {
    const mixedUpDisruptions: Disruption[] = [
        {
            ...disruptionInfoTest,
            disruptionStartDate: "25/03/2026",
            disruptionStartTime: "1123",
            validity: [
                {
                    disruptionStartDate: "25/12/2022",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/12/2022",
                    disruptionEndTime: "1123",
                },
                {
                    disruptionStartDate: "25/03/2024",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/03/2024",
                    disruptionEndTime: "1123",
                },
                {
                    disruptionStartDate: "25/03/2021",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/03/2021",
                    disruptionEndTime: "1123",
                },
            ],
        },
        {
            ...disruptionInfoTest,
            disruptionStartDate: "21/03/2025",
            disruptionStartTime: "1123",
        },
        {
            ...disruptionInfoTest,
            disruptionStartDate: "24/04/2022",
            disruptionStartTime: "1123",
            validity: [
                {
                    disruptionStartDate: "22/04/2022",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "22/05/2022",
                    disruptionEndTime: "1123",
                },
            ],
        },
    ];

    it("sorts disruptions into start date order", () => {
        const result = sortDisruptionsByStartDate(mixedUpDisruptions);

        expect(result).toStrictEqual([
            {
                disruptionId: "test",
                description: "Test description",
                disruptionType: "planned",
                summary: "Some summary",
                associatedLink: "https://example.com",
                disruptionReason: "grassFire",
                publishStartDate: "10/03/2023",
                publishStartTime: "1200",
                disruptionStartDate: "25/03/2026",
                disruptionStartTime: "1123",
                disruptionNoEndDateTime: "true",
                validity: [
                    {
                        disruptionStartDate: "25/03/2021",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/03/2021",
                        disruptionEndTime: "1123",
                    },
                    {
                        disruptionStartDate: "25/12/2022",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/12/2022",
                        disruptionEndTime: "1123",
                    },
                    {
                        disruptionStartDate: "25/03/2024",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/03/2024",
                        disruptionEndTime: "1123",
                    },
                    {
                        disruptionStartDate: "25/03/2026",
                        disruptionStartTime: "1123",
                        disruptionNoEndDateTime: "true",
                        disruptionRepeatsEndDate: undefined,
                        disruptionEndDate: undefined,
                        disruptionEndTime: undefined,
                        disruptionRepeats: undefined,
                    },
                ],
            },
            {
                disruptionId: "test",
                description: "Test description",
                disruptionType: "planned",
                summary: "Some summary",
                associatedLink: "https://example.com",
                disruptionReason: "grassFire",
                publishStartDate: "10/03/2023",
                publishStartTime: "1200",
                disruptionStartDate: "24/04/2022",
                disruptionStartTime: "1123",
                disruptionNoEndDateTime: "true",
                validity: [
                    {
                        disruptionStartDate: "22/04/2022",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "22/05/2022",
                        disruptionEndTime: "1123",
                    },
                    {
                        disruptionStartDate: "24/04/2022",
                        disruptionStartTime: "1123",
                        disruptionNoEndDateTime: "true",
                        disruptionRepeatsEndDate: undefined,
                        disruptionEndDate: undefined,
                        disruptionEndTime: undefined,
                        disruptionRepeats: undefined,
                    },
                ],
            },
            {
                disruptionId: "test",
                description: "Test description",
                disruptionType: "planned",
                summary: "Some summary",
                associatedLink: "https://example.com",
                disruptionReason: "grassFire",
                publishStartDate: "10/03/2023",
                publishStartTime: "1200",
                disruptionStartDate: "21/03/2025",
                disruptionStartTime: "1123",
                disruptionNoEndDateTime: "true",
                validity: [
                    {
                        disruptionStartDate: "21/03/2025",
                        disruptionStartTime: "1123",
                        disruptionNoEndDateTime: "true",
                        disruptionRepeatsEndDate: undefined,
                        disruptionEndDate: undefined,
                        disruptionEndTime: undefined,
                        disruptionRepeats: undefined,
                    },
                ],
            },
        ]);
    });
});
