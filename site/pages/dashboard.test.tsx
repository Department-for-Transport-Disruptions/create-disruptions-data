import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TableDisruption } from "../schemas/disruption.schema";
import { mockSessionWithOrgDetail } from "../testData/mockData";
import * as session from "../utils/apiUtils/auth";
import Dashboard, { formatDisruptions } from "./dashboard.page";
import { Datasource, MiscellaneousReason, Progress, Severity } from "@create-disruptions-data/shared-ts/enums";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";

const getSessionWithOrgDetailSpy = vi.spyOn(session, "getSessionWithOrgDetail");
vi.mock("../utils/apiUtils/auth", async () => ({
    ...(await vi.importActual<object>("../utils/apiUtils/auth")),
    getSession: vi.fn(),
}));

beforeEach(() => {
    getSessionWithOrgDetailSpy.mockResolvedValue(mockSessionWithOrgDetail);
});

afterEach(cleanup);

const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("pages", () => {
    describe("dashboard", () => {
        it("should render correctly", () => {
            const { asFragment } = render(
                <Dashboard
                    newDisruptionId={defaultNewDisruptionId}
                    canPublish
                    orgName="Test Org"
                    orgId="test-id"
                    isOperatorUser={false}
                    enableLoadingSpinnerOnPageLoad={false}
                />,
            );
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly for an operator user", () => {
            const { asFragment } = render(
                <Dashboard
                    newDisruptionId={defaultNewDisruptionId}
                    canPublish
                    orgName="Test Org"
                    orgId="test-id"
                    isOperatorUser={true}
                    enableLoadingSpinnerOnPageLoad={false}
                />,
            );
            expect(asFragment()).toMatchSnapshot();
        });

        describe("format disruptions", () => {
            it("correctly groups live disruptions", () => {
                const disruptions: TableDisruption[] = [
                    {
                        id: "c58ba826-ac18-41c5-8476-8172dfa6ea24",
                        summary: "Alien attack",
                        validityPeriods: [{ startTime: getDate().subtract(5, "days").toISOString(), endTime: null }],
                        publishStartDate: "2022-01-05T04:42:17.239Z",
                        modes: ["Tram"],
                        services: [],
                        status: Progress.open,
                        severity: Severity.verySevere,
                        dataSource: Datasource.bods,
                        operators: ["BB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: false,
                        isNetworkWideCq: true,
                        isLive: true,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 2,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                    {
                        id: "12319560-99c1-4da6-8a73-de1220f37056",
                        summary: "Bigfoot is attacking Parliament",
                        validityPeriods: [{ startTime: "2023-04-14T04:21:29.085Z", endTime: null }],
                        publishStartDate: "2022-01-19T11:41:12.445Z",
                        modes: ["Tram", "Ferry", "Train"],
                        status: Progress.open,
                        severity: Severity.severe,
                        services: [],
                        dataSource: Datasource.tnds,
                        operators: ["BB", "SB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: true,
                        isNetworkWideCq: true,
                        isLive: true,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 1,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                ];
                expect(formatDisruptions(disruptions).liveDisruptions).toHaveLength(2);
            });

            it("correctly groups upcoming disruptions", () => {
                const disruptions: TableDisruption[] = [
                    {
                        id: "c58ba826-ac18-41c5-8476-8172dfa6ea24",
                        summary: "Alien attack",
                        validityPeriods: [{ startTime: getDate().subtract(10, "days").toISOString(), endTime: null }],
                        publishStartDate: "2022-01-05T04:42:17.239Z",
                        modes: ["Tram"],
                        services: [],
                        status: Progress.open,
                        severity: Severity.verySevere,
                        dataSource: Datasource.bods,
                        operators: ["BB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: false,
                        isNetworkWideCq: true,
                        isLive: false,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 2,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                    {
                        id: "12319560-99c1-4da6-8a73-de1220f37056",
                        summary: "Bigfoot is attacking Parliament",
                        validityPeriods: [{ startTime: "2023-04-14T04:21:29.085Z", endTime: null }],
                        publishStartDate: "2022-01-19T11:41:12.445Z",
                        modes: ["Tram", "Ferry", "Train"],
                        status: Progress.open,
                        severity: Severity.severe,
                        services: [],
                        dataSource: Datasource.tnds,
                        operators: ["BB", "SB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: true,
                        isNetworkWideCq: true,
                        isLive: false,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 1,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                ];
                expect(formatDisruptions(disruptions).upcomingDisruptions).toHaveLength(2);
            });

            it("correctly groups disruptions that have closed in the last 7 days", () => {
                const disruptions: TableDisruption[] = [
                    {
                        id: "c58ba826-ac18-41c5-8476-8172dfa6ea24",
                        summary: "Alien attack",
                        validityPeriods: [
                            {
                                startTime: getDate().subtract(10, "days").toISOString(),
                                endTime: getDate().subtract(4, "days").toISOString(),
                            },
                        ],
                        publishStartDate: "2022-01-05T04:42:17.239Z",
                        modes: ["Tram"],
                        services: [],
                        status: Progress.closed,
                        severity: Severity.verySevere,
                        dataSource: Datasource.bods,
                        operators: ["BB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: false,
                        isNetworkWideCq: true,
                        isLive: false,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 2,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                    {
                        id: "12319560-99c1-4da6-8a73-de1220f37056",
                        summary: "Bigfoot is attacking Parliament",
                        validityPeriods: [
                            {
                                startTime: "2023-04-14T04:21:29.085Z",
                                endTime: getDate().subtract(8, "days").toISOString(),
                            },
                        ],
                        publishStartDate: "2022-01-19T11:41:12.445Z",
                        modes: ["Tram", "Ferry", "Train"],
                        status: Progress.closed,
                        severity: Severity.severe,
                        services: [],
                        dataSource: Datasource.tnds,
                        operators: ["BB", "SB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: true,
                        isNetworkWideCq: true,
                        isLive: false,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 1,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                ];
                expect(formatDisruptions(disruptions).recentlyClosedDisruptions).toHaveLength(1);
            });

            it("correctly adds up disruptions pending review", () => {
                const disruptions: TableDisruption[] = [
                    {
                        id: "c58ba826-ac18-41c5-8476-8172dfa6ea24",
                        summary: "Alien attack",
                        validityPeriods: [
                            {
                                startTime: getDate().subtract(10, "days").toISOString(),
                                endTime: getDate().subtract(4, "days").toISOString(),
                            },
                        ],
                        publishStartDate: "2022-01-05T04:42:17.239Z",
                        modes: ["Tram"],
                        services: [],
                        status: Progress.editPendingApproval,
                        severity: Severity.verySevere,
                        dataSource: Datasource.bods,
                        operators: ["BB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: false,
                        isNetworkWideCq: true,
                        isLive: false,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 2,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                    {
                        id: "12319560-99c1-4da6-8a73-de1220f37056",
                        summary: "Bigfoot is attacking Parliament",
                        validityPeriods: [
                            {
                                startTime: "2023-04-14T04:21:29.085Z",
                                endTime: getDate().subtract(8, "days").toISOString(),
                            },
                        ],
                        publishStartDate: "2022-01-19T11:41:12.445Z",
                        modes: ["Tram", "Ferry", "Train"],
                        status: Progress.draftPendingApproval,
                        severity: Severity.severe,
                        services: [],
                        dataSource: Datasource.tnds,
                        operators: ["BB", "SB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: true,
                        isNetworkWideCq: true,
                        isLive: false,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 1,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                ];
                expect(formatDisruptions(disruptions).pendingApprovalCount).toBe(2);
            });

            it("ignores draft disruptions", () => {
                const disruptions: TableDisruption[] = [
                    {
                        id: "c58ba826-ac18-41c5-8476-8172dfa6ea24",
                        summary: "Alien attack",
                        validityPeriods: [
                            {
                                startTime: getDate().subtract(10, "days").toISOString(),
                                endTime: getDate().subtract(4, "days").toISOString(),
                            },
                        ],
                        publishStartDate: "2022-01-05T04:42:17.239Z",
                        modes: ["Tram"],
                        services: [],
                        status: Progress.draft,
                        severity: Severity.verySevere,
                        dataSource: Datasource.bods,
                        operators: ["BB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: false,
                        isNetworkWideCq: true,
                        isLive: false,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 2,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                    {
                        id: "12319560-99c1-4da6-8a73-de1220f37056",
                        summary: "Bigfoot is attacking Parliament",
                        validityPeriods: [
                            {
                                startTime: "2023-04-14T04:21:29.085Z",
                                endTime: getDate().subtract(8, "days").toISOString(),
                            },
                        ],
                        publishStartDate: "2022-01-19T11:41:12.445Z",
                        modes: ["Tram", "Ferry", "Train"],
                        status: Progress.draftPendingApproval,
                        severity: Severity.severe,
                        services: [],
                        dataSource: Datasource.tnds,
                        operators: ["BB", "SB"],
                        displayId: "8fg3ha",
                        isOperatorWideCq: true,
                        isNetworkWideCq: true,
                        isLive: false,
                        stopsAffectedCount: 0,
                        servicesAffectedCount: 1,
                        consequenceLength: 1,
                        description: "A description",
                        disruptionReason: MiscellaneousReason.roadworks,
                        creationTime: "24/11/2023",
                        disruptionType: "planned",
                    },
                ];
                expect(formatDisruptions(disruptions)).toEqual({
                    liveDisruptions: [],
                    upcomingDisruptions: [],
                    recentlyClosedDisruptions: [],
                    pendingApprovalCount: 1,
                });
            });
        });
    });
});
