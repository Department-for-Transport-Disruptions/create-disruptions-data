import { MiscellaneousReason, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { describe, it, expect } from "vitest";
import { getFutureDateAsString } from "./dates";
import { CD_DATE_FORMAT } from "../constants";
import { OperatorConsequence, operatorConsequenceSchema } from "../schemas/consequence.schema";
import { createDisruptionSchema, Disruption } from "../schemas/create-disruption.schema";
import { databaseData } from "../testData/mockData";
import { getPageStateFromCookies, sortDisruptionsByStartDate, splitCamelCaseToString } from ".";

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

        const disruptionData: Disruption = {
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

        const parsedInput = getPageStateFromCookies(JSON.stringify(disruptionData), "", createDisruptionSchema);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(disruptionData);
    });

    it("should parse to expected type for ConsequenceOperatorPageInputs", () => {
        const operatorData: OperatorConsequence = {
            consequenceOperator: "FMAN",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            removeFromJourneyPlanners: "no",
            disruptionDelay: "",
            disruptionSeverity: Severity.slight,
            vehicleMode: VehicleMode.bus,
            consequenceType: "operatorWide",
        };

        const parsedInput = getPageStateFromCookies(JSON.stringify(operatorData), "", operatorConsequenceSchema);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(operatorData);
    });
});

describe("sortDisruptionsByStartDate", () => {
    const mixedUpDisruptions: PtSituationElement[] = [
        {
            ...databaseData[0],
            ValidityPeriod: [
                {
                    StartTime: "2023-03-25T11:23:24.529Z",
                    EndTime: undefined,
                },
                {
                    StartTime: "2022-12-25T11:23:24.529Z",
                    EndTime: undefined,
                },
                {
                    StartTime: "2024-03-25T11:23:24.529Z",
                    EndTime: undefined,
                },
            ],
        },
        {
            ...databaseData[0],
            ValidityPeriod: [
                {
                    StartTime: "2025-03-21T11:23:24.529Z",
                    EndTime: "2023-03-22T11:23:24.529Z",
                },
            ],
        },
        {
            ...databaseData[0],
            ValidityPeriod: [
                {
                    StartTime: "2022-04-24T11:23:24.529Z",
                    EndTime: "2024-03-22T11:23:24.529Z",
                },
                {
                    StartTime: "2022-04-22T11:23:24.529Z",
                    EndTime: undefined,
                },
            ],
        },
    ];

    it("sorts disruptions into start date order", () => {
        const result = sortDisruptionsByStartDate(mixedUpDisruptions);

        expect(result).toStrictEqual([
            {
                CreationTime: "2023-01-01T01:10:00Z",
                ParticipantRef: "ref",
                SituationNumber: "aaaaa-bbbbb-ccccc",
                Version: 1,
                Source: { SourceType: "feed", TimeOfCommunication: "2023-01-01T01:10:00Z" },
                Progress: "open",
                ValidityPeriod: [
                    { StartTime: "2022-04-22T11:23:24.529Z", EndTime: undefined },
                    {
                        StartTime: "2022-04-24T11:23:24.529Z",
                        EndTime: "2024-03-22T11:23:24.529Z",
                    },
                ],
                PublicationWindow: {
                    StartTime: "2023-03-02T10:10:00Z",
                    EndTime: "2023-03-09T10:10:00Z",
                },
                ReasonType: "PersonnelReason",
                PersonnelReason: "staffSickness",
                Planned: true,
                Summary: "Disruption Summary",
                Description: "Disruption Description",
            },
            {
                CreationTime: "2023-01-01T01:10:00Z",
                ParticipantRef: "ref",
                SituationNumber: "aaaaa-bbbbb-ccccc",
                Version: 1,
                Source: { SourceType: "feed", TimeOfCommunication: "2023-01-01T01:10:00Z" },
                Progress: "open",
                ValidityPeriod: [
                    { StartTime: "2022-12-25T11:23:24.529Z", EndTime: undefined },
                    { StartTime: "2023-03-25T11:23:24.529Z", EndTime: undefined },
                    { StartTime: "2024-03-25T11:23:24.529Z", EndTime: undefined },
                ],
                PublicationWindow: {
                    StartTime: "2023-03-02T10:10:00Z",
                    EndTime: "2023-03-09T10:10:00Z",
                },
                ReasonType: "PersonnelReason",
                PersonnelReason: "staffSickness",
                Planned: true,
                Summary: "Disruption Summary",
                Description: "Disruption Description",
            },
            {
                CreationTime: "2023-01-01T01:10:00Z",
                ParticipantRef: "ref",
                SituationNumber: "aaaaa-bbbbb-ccccc",
                Version: 1,
                Source: { SourceType: "feed", TimeOfCommunication: "2023-01-01T01:10:00Z" },
                Progress: "open",
                ValidityPeriod: [
                    {
                        StartTime: "2025-03-21T11:23:24.529Z",
                        EndTime: "2023-03-22T11:23:24.529Z",
                    },
                ],
                PublicationWindow: {
                    StartTime: "2023-03-02T10:10:00Z",
                    EndTime: "2023-03-09T10:10:00Z",
                },
                ReasonType: "PersonnelReason",
                PersonnelReason: "staffSickness",
                Planned: true,
                Summary: "Disruption Summary",
                Description: "Disruption Description",
            },
        ]);
    });
});
