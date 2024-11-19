import { describe, expect, it } from "vitest";
import { sortDisruptionsByStartDate } from ".";
import { Disruption, DisruptionInfo } from "../disruptionTypes";
import { EnvironmentReason, PublishStatus } from "../enums";

const DEFAULT_ORG_ID = "35bae327-4af0-4bbf-8bfa-2c085f214483";

const disruptionInfo: DisruptionInfo = {
    id: "test",
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
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
};

describe("sortDisruptionsByStartDate", () => {
    const mixedUpDisruptions: Disruption[] = [
        {
            ...disruptionInfo,
            publishStatus: PublishStatus.draft,
            disruptionStartDate: "25/03/2026",
            publishStartDate: "24/03/2021",
            disruptionStartTime: "1123",
            creationTime: undefined,
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
            publishStartTimestamp: "2023-03-10T12:00:00Z",
            publishEndTimestamp: null,
            validityStartTimestamp: "2021-03-25T11:23:00Z",
            validityEndTimestamp: null,
            template: false,
        },
        {
            ...disruptionInfo,
            publishStatus: PublishStatus.draft,
            disruptionStartDate: "21/03/2025",
            disruptionStartTime: "1123",
            template: false,
            creationTime: undefined,
            publishStartTimestamp: "2023-03-10T12:00:00Z",
            publishEndTimestamp: null,
            validityStartTimestamp: "2025-03-21T11:23:00Z",
            validityEndTimestamp: null,
        },
        {
            ...disruptionInfo,
            publishStatus: PublishStatus.draft,
            publishStartDate: "24/05/2021",
            disruptionStartDate: "24/05/2022",
            disruptionStartTime: "1123",
            creationTime: undefined,
            validity: [
                {
                    disruptionStartDate: "22/04/2022",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "22/05/2022",
                    disruptionEndTime: "1123",
                },
            ],
            publishStartTimestamp: "2021-05-24T11:23:00Z",
            publishEndTimestamp: null,
            validityStartTimestamp: "2022-04-22T11:23:00Z",
            validityEndTimestamp: null,
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
