import renderer from "react-test-renderer";
import { describe, it, expect, vi, afterEach } from "vitest";
import Dashboard, { DashboardDisruption, getServerSideProps } from "./dashboard.page";
import * as dynamo from "../data/dynamo";
import { disruptionArray, disruptionWithConsequences } from "../testData/mockData";
import { getFutureDateAsString } from "../utils/dates";

const getDisruptionsSpy = vi.spyOn(dynamo, "getPublishedDisruptionsDataFromDynamo");
vi.mock("../data/dynamo");

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
                getDisruptionsSpy.mockResolvedValue([]);

                const actualProps = await getServerSideProps();
                expect(actualProps.props).toStrictEqual({ liveDisruptions: [], upcomingDisruptions: [] });
            });

            it("should return live disruptions if the data returned from the database has live dates", async () => {
                getDisruptionsSpy.mockResolvedValue([disruptionWithConsequences]);

                const actualProps = await getServerSideProps();
                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [
                                { startTime: "2023-03-10T12:00:00.000Z", endTime: "2023-03-17T17:00:00.000Z" },
                                { startTime: "2023-03-18T12:00:00.000Z", endTime: null },
                            ],
                        },
                    ],
                    upcomingDisruptions: [],
                });
            });

            it("should return upcoming disruptions if the data returned from the database has upcoming dates", async () => {
                getDisruptionsSpy.mockResolvedValue([
                    {
                        ...disruptionWithConsequences,
                        validity: [],
                        disruptionStartDate: "12/02/2999",
                        disruptionStartTime: "1200",
                    },
                ]);

                const actualProps = await getServerSideProps();

                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [],
                    upcomingDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [{ startTime: "2999-02-12T12:00:00.000Z", endTime: null }],
                        },
                    ],
                });
            });

            it("should return live and upcoming disruptions if the data returned from the database has live and upcoming dates", async () => {
                getDisruptionsSpy.mockResolvedValue([
                    ...disruptionArray,
                    {
                        ...disruptionWithConsequences,
                        validity: [],
                        disruptionStartDate: "12/02/2999",
                        disruptionStartTime: "1200",
                    },
                ]);

                const actualProps = await getServerSideProps();

                expect(actualProps.props).toStrictEqual({
                    liveDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [{ startTime: "2022-03-10T11:00:00.000Z", endTime: null }],
                        },
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [
                                { startTime: "2023-03-10T12:00:00.000Z", endTime: "2023-03-17T17:00:00.000Z" },
                                { startTime: "2023-03-18T12:00:00.000Z", endTime: null },
                            ],
                        },
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [
                                { startTime: "2023-03-10T12:00:00.000Z", endTime: "2023-03-17T17:00:00.000Z" },
                                { startTime: "2023-03-18T12:00:00.000Z", endTime: null },
                            ],
                        },
                    ],
                    upcomingDisruptions: [
                        {
                            id: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                            summary: "Some summary",
                            validityPeriods: [{ startTime: "2999-02-12T12:00:00.000Z", endTime: null }],
                        },
                    ],
                });
            });
        });
    });
});
