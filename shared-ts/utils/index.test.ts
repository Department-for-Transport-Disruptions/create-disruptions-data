import { describe, it, expect } from "vitest";
import { Disruption, DisruptionInfo } from "../disruptionTypes";
import { EnvironmentReason, MiscellaneousReason, PublishStatus } from "../enums";
import { getSortedDisruptionFinalEndDate, sortDisruptionsByStartDate } from ".";

const DEFAULT_ORG_ID = "35bae327-4af0-4bbf-8bfa-2c085f214483";

const disruptionInfo: DisruptionInfo = {
    disruptionId: "test",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    associatedLink: "https://example.com",
    disruptionReason: EnvironmentReason.grassFire,
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    disruptionStartDate: "10/03/2023",
    disruptionStartTime: "1200",
    disruptionNoEndDateTime: "true",
    disruptionEndDate: "",
    disruptionEndTime: "",
    publishEndDate: "",
    publishEndTime: "",
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
};

describe("sortDisruptionsByStartDate", () => {
    const mixedUpDisruptions: Disruption[] = [
        {
            ...disruptionInfo,
            publishStatus: PublishStatus.draft,
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
            template: false,
        },
        {
            ...disruptionInfo,
            publishStatus: PublishStatus.draft,
            disruptionStartDate: "21/03/2025",
            disruptionStartTime: "1123",
            template: false,
        },
        {
            ...disruptionInfo,
            publishStatus: PublishStatus.draft,
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
            template: false,
        },
    ];

    it("sorts disruptions into start date order", () => {
        const result = sortDisruptionsByStartDate(mixedUpDisruptions);

        expect(result).toStrictEqual([
            {
                publishStatus: PublishStatus.draft,
                disruptionId: "test",
                description: "Test description",
                disruptionType: "planned",
                orgId: DEFAULT_ORG_ID,
                summary: "Some summary",
                associatedLink: "https://example.com",
                disruptionReason: "grassFire",
                publishStartDate: "10/03/2023",
                publishStartTime: "1200",
                disruptionStartDate: "25/03/2026",
                disruptionStartTime: "1123",
                disruptionNoEndDateTime: "true",
                displayId: "8fg3ha",
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
                template: false,
            },
            {
                publishStatus: PublishStatus.draft,
                disruptionId: "test",
                description: "Test description",
                disruptionType: "planned",
                orgId: DEFAULT_ORG_ID,
                summary: "Some summary",
                associatedLink: "https://example.com",
                disruptionReason: "grassFire",
                publishStartDate: "10/03/2023",
                publishStartTime: "1200",
                disruptionStartDate: "24/04/2022",
                disruptionStartTime: "1123",
                disruptionNoEndDateTime: "true",
                displayId: "8fg3ha",
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
                template: false,
            },
            {
                publishStatus: PublishStatus.draft,
                disruptionId: "test",
                description: "Test description",
                disruptionType: "planned",
                orgId: DEFAULT_ORG_ID,
                summary: "Some summary",
                associatedLink: "https://example.com",
                disruptionReason: "grassFire",
                publishStartDate: "10/03/2023",
                publishStartTime: "1200",
                disruptionStartDate: "21/03/2025",
                disruptionStartTime: "1123",
                disruptionNoEndDateTime: "true",
                displayId: "8fg3ha",
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
                template: false,
            },
        ]);
    });
});

describe("getSortedDisruptionFinalEndDate", () => {
    it("gets the final end date for a non-repeating sorted disruption", () => {
        const disruption: Disruption = {
            publishStatus: PublishStatus.draft,
            disruptionId: "test",
            description: "Test description",
            disruptionType: "planned",
            summary: "Some summary",
            associatedLink: "https://example.com",
            disruptionReason: MiscellaneousReason.accident,
            publishStartDate: "10/03/2023",
            publishStartTime: "1200",
            displayId: "8fg3ha",
            orgId: DEFAULT_ORG_ID,
            disruptionStartDate: "25/03/2021",
            disruptionStartTime: "1123",
            disruptionEndDate: "",
            disruptionEndTime: "",
            publishEndDate: "",
            publishEndTime: "",
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
            ],
            template: false,
        };

        const result = getSortedDisruptionFinalEndDate(disruption);

        expect(result?.toISOString()).toBe("2024-03-30T11:23:00.000Z");
    });

    it("gets the final end date for a repeating sorted disruption", () => {
        const disruption: Disruption = {
            publishStatus: PublishStatus.draft,
            disruptionId: "test",
            description: "Test description",
            disruptionType: "planned",
            summary: "Some summary",
            associatedLink: "https://example.com",
            disruptionReason: MiscellaneousReason.accident,
            publishStartDate: "10/03/2023",
            publishStartTime: "1200",
            displayId: "8fg3ha",
            orgId: DEFAULT_ORG_ID,
            disruptionStartDate: "25/03/2021",
            disruptionStartTime: "1123",
            disruptionEndDate: "",
            disruptionEndTime: "",
            publishEndDate: "",
            publishEndTime: "",
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
                    disruptionStartDate: "02/05/2023",
                    disruptionStartTime: "0900",
                    disruptionEndDate: "30/12/2022",
                    disruptionEndTime: "1123",
                    disruptionRepeats: "weekly",
                    disruptionRepeatsEndDate: "22/05/2023",
                },
            ],
            template: false,
        };

        const result = getSortedDisruptionFinalEndDate(disruption);

        expect(result?.format("DD/MM/YYYY")).toBe("22/05/2023");
    });
});
