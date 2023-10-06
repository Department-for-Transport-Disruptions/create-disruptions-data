import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { randomUUID } from "crypto";
import Dashboard, { DashboardDisruption, getServerSideProps } from "./dashboard.page";
import { CD_DATE_FORMAT } from "../constants";
import * as dynamo from "../data/dynamo";
import { defaultModes } from "../schemas/organisation.schema";
import { SessionWithOrgDetail } from "../schemas/session.schema";
import { disruptionArray, disruptionWithConsequencesAndSocialMediaPosts, getMockContext } from "../testData/mockData";
import * as session from "../utils/apiUtils/auth";

const getDisruptionsSpy = vi.spyOn(dynamo, "getPublishedDisruptionsDataFromDynamo");
const getPendingDisruptionsSpy = vi.spyOn(dynamo, "getPendingDisruptionsIdsFromDynamo");
vi.mock("../data/dynamo");

const getSessionWithOrgDetailSpy = vi.spyOn(session, "getSessionWithOrgDetail");
vi.mock("../utils/apiUtils/auth", async () => ({
    ...(await vi.importActual<object>("../utils/apiUtils/auth")),
    getSession: vi.fn(),
}));

beforeEach(() => {
    getSessionWithOrgDetailSpy.mockResolvedValue(defaultSession);
});
const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const recentlyClosedDate = getDate().subtract(4, "day").format(CD_DATE_FORMAT);
const isoRecentlyClosedDate = getDate().subtract(4, "day").format("YYYY-MM-DD");

const defaultSession: SessionWithOrgDetail = {
    email: "test@example.com",
    isOrgAdmin: false,
    isOrgPublisher: false,
    isOrgStaff: false,
    isSystemAdmin: true,
    orgId: randomUUID(),
    username: "test@example.com",
    name: "Test User",
    orgName: "Nexus",
    adminAreaCodes: ["A", "B", "C"],
    mode: defaultModes,
};

const disruptions: DashboardDisruption[] = [
    {
        id: "12",
        summary: "A bad disruption",
        validityPeriods: [
            {
                startTime: "2023-03-21T11:23:24.529Z",
                endTime: null,
            },
        ],
        displayId: "8fg3ha",
    },
    {
        id: "33",
        summary: "A more ok disruption",
        validityPeriods: [
            {
                startTime: "2023-03-21T11:23:24.529Z",
                endTime: "2023-03-22T11:23:24.529Z",
            },
        ],
        displayId: "8fg3ha",
    },
    {
        id: "44",
        summary: "Another disruption",
        validityPeriods: [
            {
                startTime: "2023-04-21T11:23:24.529Z",
                endTime: "2024-03-22T11:23:24.529Z",
            },
            {
                startTime: "2023-04-22T11:23:24.529Z",
                endTime: null,
            },
        ],
        displayId: "8fg3ha",
    },
    {
        id: "55",
        summary: "Another disruption",
        validityPeriods: [
            {
                startTime: "2023-04-21T11:23:24.529Z",
                endTime: "2024-03-22T11:23:24.529Z",
            },
            {
                startTime: "2023-04-22T11:23:24.529Z",
                endTime: null,
            },
        ],
        displayId: "8fg3ha",
    },
];

describe("pages", () => {
    describe("dashboard", () => {
        it("should render correctly when there are no disruptions", () => {
            const tree = renderer
                .create(
                    <Dashboard
                        liveDisruptions={[]}
                        upcomingDisruptions={[]}
                        recentlyClosedDisruptions={[]}
                        newDisruptionId={defaultNewDisruptionId}
                        canPublish
                        orgName="Nexus"
                        stage="dev"
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are only live disruptions", () => {
            const tree = renderer
                .create(
                    <Dashboard
                        liveDisruptions={disruptions}
                        upcomingDisruptions={[]}
                        recentlyClosedDisruptions={[]}
                        newDisruptionId={defaultNewDisruptionId}
                        canPublish
                        orgName="Nexus"
                        stage="dev"
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are only upcoming disruptions", () => {
            const tree = renderer
                .create(
                    <Dashboard
                        liveDisruptions={[]}
                        upcomingDisruptions={disruptions}
                        recentlyClosedDisruptions={[]}
                        newDisruptionId={defaultNewDisruptionId}
                        canPublish
                        orgName="Nexus"
                        stage="dev"
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are only recently closed disruptions", () => {
            const tree = renderer
                .create(
                    <Dashboard
                        liveDisruptions={[]}
                        upcomingDisruptions={[]}
                        recentlyClosedDisruptions={disruptions}
                        newDisruptionId={defaultNewDisruptionId}
                        canPublish
                        orgName="Nexus"
                        stage="dev"
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are all three live, upcoming and recently closed disruptions", () => {
            const tree = renderer
                .create(
                    <Dashboard
                        liveDisruptions={[disruptions[0]]}
                        upcomingDisruptions={[disruptions[1], disruptions[2]]}
                        recentlyClosedDisruptions={[disruptions[3]]}
                        newDisruptionId={defaultNewDisruptionId}
                        canPublish
                        orgName="Nexus"
                        stage="dev"
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        describe("getServerSideProps", () => {
            afterEach(() => {
                vi.resetAllMocks();
            });

            beforeEach(() => {
                getPendingDisruptionsSpy.mockResolvedValue(new Set<string>());
            });

            it("should return no disruptions if there is no data returned from the database call", async () => {
                getDisruptionsSpy.mockResolvedValue([]);

                const ctx = getMockContext();

                const actualProps = await getServerSideProps(ctx);
                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [],
                    upcomingDisruptions: [],
                    recentlyClosedDisruptions: [],
                    newDisruptionId: expect.any(String) as string,
                    pendingApprovalCount: 0,
                    canPublish: true,
                    orgName: "Nexus",
                    
                });
            });

            it("should return live disruptions if the data returned from the database has live dates", async () => {
                getDisruptionsSpy.mockResolvedValue([disruptionWithConsequencesAndSocialMediaPosts]);
                const ctx = getMockContext();

                const actualProps = await getServerSideProps(ctx);
                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [
                                {
                                    startTime: "2023-03-10T12:00:00.000Z",
                                    endTime: null,
                                },
                                { startTime: "2023-03-18T12:00:00.000Z", endTime: null },
                            ],
                            displayId: "8fg3ha",
                        },
                    ],
                    upcomingDisruptions: [],
                    recentlyClosedDisruptions: [],
                    newDisruptionId: expect.any(String) as string,
                    pendingApprovalCount: 0,
                    canPublish: true,
                    orgName: "Nexus",
                    
                });
            });

            it("should return upcoming disruptions if the data returned from the database has upcoming dates", async () => {
                getDisruptionsSpy.mockResolvedValue([
                    {
                        ...disruptionWithConsequencesAndSocialMediaPosts,
                        validity: [],
                        disruptionStartDate: "12/02/2999",
                        disruptionStartTime: "1300",
                    },
                ]);

                const ctx = getMockContext();

                const actualProps = await getServerSideProps(ctx);

                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [],
                    upcomingDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [{ startTime: "2999-02-12T13:00:00.000Z", endTime: null }],
                            displayId: "8fg3ha",
                        },
                    ],
                    recentlyClosedDisruptions: [],
                    newDisruptionId: expect.any(String) as string,
                    pendingApprovalCount: 0,
                    canPublish: true,
                    orgName: "Nexus",
                    
                });
            });

            it("should return recently closed disruptions if the data returned from the database has end dates within 7 days", async () => {
                getDisruptionsSpy.mockResolvedValue([
                    {
                        ...disruptionWithConsequencesAndSocialMediaPosts,
                        validity: [],
                        disruptionStartDate: "12/02/2023",
                        disruptionStartTime: "1300",
                        disruptionEndDate: recentlyClosedDate,
                        disruptionEndTime: "1300",
                        disruptionNoEndDateTime: undefined,
                    },
                ]);

                const ctx = getMockContext();

                const actualProps = await getServerSideProps(ctx);

                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [],
                    recentlyClosedDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [
                                {
                                    startTime: "2023-02-12T13:00:00.000Z",
                                    endTime: `${isoRecentlyClosedDate}T12:00:00.000Z`,
                                },
                            ],
                            displayId: "8fg3ha",
                        },
                    ],
                    upcomingDisruptions: [],
                    newDisruptionId: expect.any(String) as string,
                    pendingApprovalCount: 0,
                    canPublish: true,
                    orgName: "Nexus",
                    
                });
            });

            it("should return live and upcoming disruptions if the data returned from the database has live and upcoming dates", async () => {
                getDisruptionsSpy.mockResolvedValue([
                    ...disruptionArray,
                    {
                        ...disruptionWithConsequencesAndSocialMediaPosts,
                        validity: [],
                        disruptionStartDate: "12/02/2999",
                        disruptionStartTime: "1200",
                    },
                ]);

                const ctx = getMockContext();

                const actualProps = await getServerSideProps(ctx);

                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [{ startTime: "2022-03-10T11:00:00.000Z", endTime: null }],
                            displayId: "8fg3ha",
                        },
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [
                                {
                                    startTime: "2023-03-10T12:00:00.000Z",
                                    endTime: null,
                                },
                                { startTime: "2023-03-18T12:00:00.000Z", endTime: null },
                            ],
                            displayId: "8fg3ha",
                        },
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [
                                {
                                    startTime: "2023-03-10T12:00:00.000Z",
                                    endTime: null,
                                },
                                { startTime: "2023-03-18T12:00:00.000Z", endTime: null },
                            ],
                            displayId: "8fg3ha",
                        },
                    ],
                    upcomingDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [{ startTime: "2999-02-12T12:00:00.000Z", endTime: null }],
                            displayId: "8fg3ha",
                        },
                    ],
                    recentlyClosedDisruptions: [],
                    newDisruptionId: expect.any(String) as string,
                    pendingApprovalCount: 0,
                    canPublish: true,
                    orgName: "Nexus",
                    
                });
            });
        });
    });
});
