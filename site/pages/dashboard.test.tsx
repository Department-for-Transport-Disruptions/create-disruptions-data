import renderer from "react-test-renderer";
import { describe, it, expect, vi, afterEach } from "vitest";
import Dashboard, { DashboardDisruption, getServerSideProps } from "./dashboard.page";
import * as dynamo from "../data/dynamo";
import { databaseData } from "../testData/mockData";

const getDisruptionsSpy = vi.spyOn(dynamo, "getDisruptionsDataFromDynamo");
vi.mock("../data/dynamo");

const disruptions: DashboardDisruption[] = [
    {
        id: "12",
        summary: "A bad disruption",
        validityPeriod: [
            {
                startTime: "2023-03-21T11:23:24.529Z",
                endTime: undefined,
            },
        ],
    },
    {
        id: "33",
        summary: "A more ok disruption",
        validityPeriod: [
            {
                startTime: "2023-03-21T11:23:24.529Z",
                endTime: "2023-03-22T11:23:24.529Z",
            },
        ],
    },
    {
        id: "44",
        summary: "Another disruption",
        validityPeriod: [
            {
                startTime: "2023-04-21T11:23:24.529Z",
                endTime: "2024-03-22T11:23:24.529Z",
            },
            {
                startTime: "2023-04-21T11:23:24.529Z",
                endTime: undefined,
            },
        ],
    },
];

describe("pages", () => {
    describe("dashboard", () => {
        it("should render correctly when there are no disruptions", () => {
            const tree = renderer.create(<Dashboard liveDisruptions={[]} upcomingDisruptions={[]} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are only live disruptions", () => {
            const tree = renderer.create(<Dashboard liveDisruptions={disruptions} upcomingDisruptions={[]} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are only upcoming disruptions", () => {
            const tree = renderer.create(<Dashboard liveDisruptions={[]} upcomingDisruptions={disruptions} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are both live and upcoming disruptions", () => {
            const tree = renderer
                .create(
                    <Dashboard
                        liveDisruptions={[disruptions[0]]}
                        upcomingDisruptions={[disruptions[1], disruptions[2]]}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        describe("getServerSideProps", () => {
            afterEach(() => {
                vi.resetAllMocks();
            });

            it("should return no disruptions if there is no data returned from the database call", async () => {
                getDisruptionsSpy.mockResolvedValue(undefined);

                const actualProps = await getServerSideProps();
                expect(actualProps.props).toStrictEqual({ liveDisruptions: [], upcomingDisruptions: [] });
            });

            it("should return live disruptions if the data returned from the database has live dates", async () => {
                getDisruptionsSpy.mockResolvedValue(databaseData);

                const actualProps = await getServerSideProps();
                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [
                        {
                            id: "aaaaa-bbbbb-ccccc",
                            summary: "Disruption Summary",
                            validityPeriod: [
                                {
                                    endTime: undefined,
                                    startTime: "2023-03-03T01:10:00Z",
                                },
                            ],
                        },
                        {
                            id: "11111-22222-33333",
                            summary: "Disruption Summary 2",
                            validityPeriod: [
                                {
                                    endTime: "2023-05-01T01:10:00Z",
                                    startTime: "2023-03-03T01:10:00Z",
                                },
                                {
                                    endTime: undefined,
                                    startTime: "2023-05-03T01:10:00Z",
                                },
                            ],
                        },
                        {
                            id: "ddddd-eeeee-fffff",
                            summary: "Disruption Summary 3",
                            validityPeriod: [
                                {
                                    endTime: undefined,
                                    startTime: "2023-03-03T01:10:00Z",
                                },
                            ],
                        },
                    ],
                    upcomingDisruptions: [],
                });
            });

            it("should return upcoming disruptions if the data returned from the database has upcoming dates", async () => {
                const modifiedData = databaseData.map((data, index) => {
                    return {
                        ...data,
                        ValidityPeriod: [
                            {
                                StartTime: `202${(index + 6).toString()}-03-03T01:10:00Z`,
                                EndTime: data.ValidityPeriod[0].EndTime,
                            },
                        ],
                    };
                });

                getDisruptionsSpy.mockResolvedValue(modifiedData);

                const actualProps = await getServerSideProps();
                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [],
                    upcomingDisruptions: [
                        {
                            id: "aaaaa-bbbbb-ccccc",
                            summary: "Disruption Summary",
                            validityPeriod: [
                                {
                                    endTime: undefined,
                                    startTime: "2026-03-03T01:10:00Z",
                                },
                            ],
                        },
                        {
                            id: "11111-22222-33333",
                            summary: "Disruption Summary 2",
                            validityPeriod: [
                                {
                                    endTime: "2023-05-01T01:10:00Z",
                                    startTime: "2027-03-03T01:10:00Z",
                                },
                            ],
                        },
                        {
                            id: "ddddd-eeeee-fffff",
                            summary: "Disruption Summary 3",
                            validityPeriod: [
                                {
                                    endTime: undefined,
                                    startTime: "2028-03-03T01:10:00Z",
                                },
                            ],
                        },
                    ],
                });
            });

            it("should return live and upcoming disruptions if the data returned from the database has live and upcoming dates", async () => {
                const modifiedData = databaseData.map((data, index) => {
                    return {
                        ...data,
                        ValidityPeriod: [
                            {
                                StartTime: `202${(index + 6).toString()}-03-03T01:10:00Z`,
                                EndTime: data.ValidityPeriod[0].EndTime,
                            },
                        ],
                    };
                });
                getDisruptionsSpy.mockResolvedValue([...databaseData, ...modifiedData]);

                const actualProps = await getServerSideProps();
                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [
                        {
                            id: "aaaaa-bbbbb-ccccc",
                            summary: "Disruption Summary",
                            validityPeriod: [
                                {
                                    endTime: undefined,
                                    startTime: "2023-03-03T01:10:00Z",
                                },
                            ],
                        },
                        {
                            id: "11111-22222-33333",
                            summary: "Disruption Summary 2",
                            validityPeriod: [
                                {
                                    endTime: "2023-05-01T01:10:00Z",
                                    startTime: "2023-03-03T01:10:00Z",
                                },
                                {
                                    endTime: undefined,
                                    startTime: "2023-05-03T01:10:00Z",
                                },
                            ],
                        },
                        {
                            id: "ddddd-eeeee-fffff",
                            summary: "Disruption Summary 3",
                            validityPeriod: [
                                {
                                    endTime: undefined,
                                    startTime: "2023-03-03T01:10:00Z",
                                },
                            ],
                        },
                    ],
                    upcomingDisruptions: [
                        {
                            id: "aaaaa-bbbbb-ccccc",
                            summary: "Disruption Summary",
                            validityPeriod: [
                                {
                                    endTime: undefined,
                                    startTime: "2026-03-03T01:10:00Z",
                                },
                            ],
                        },
                        {
                            id: "11111-22222-33333",
                            summary: "Disruption Summary 2",
                            validityPeriod: [
                                {
                                    endTime: "2023-05-01T01:10:00Z",
                                    startTime: "2027-03-03T01:10:00Z",
                                },
                            ],
                        },
                        {
                            id: "ddddd-eeeee-fffff",
                            summary: "Disruption Summary 3",
                            validityPeriod: [
                                {
                                    endTime: undefined,
                                    startTime: "2028-03-03T01:10:00Z",
                                },
                            ],
                        },
                    ],
                });
            });
        });
    });
});
