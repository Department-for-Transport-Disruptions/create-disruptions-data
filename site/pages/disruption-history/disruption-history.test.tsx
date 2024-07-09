import { History } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import renderer from "react-test-renderer";
import { afterAll, describe, expect, it, vi } from "vitest";
import * as dynamo from "../../data/dynamo";
import { DEFAULT_DISRUPTION_ID, disruptionWithConsequences, getMockContext } from "../../testData/mockData";
import DisruptionHistory, { getServerSideProps } from "./[disruptionId].page";

const history: History[] = [
    {
        datetime: "2023-05-19T14:45:00Z",
        status: PublishStatus.published,
        user: "Test User 3",
        historyItems: ["Some Text Again", "Some More Text"],
    },
    {
        datetime: "2023-05-19T14:40:00Z",
        status: PublishStatus.pendingApproval,
        user: "Test User 1",
        historyItems: ["Some Text"],
    },
];

const historyToSort: History[] = [
    {
        datetime: "2023-05-19T14:40:00Z",
        status: PublishStatus.pendingApproval,
        user: "Test User 1",
        historyItems: ["Some Text"],
    },
    {
        datetime: "2023-05-11T14:40:00Z",
        status: PublishStatus.pendingApproval,
        user: "Test User 1",
        historyItems: ["Some Text"],
    },
    {
        datetime: "2023-05-13T14:45:00Z",
        status: PublishStatus.published,
        user: "Test User 3",
        historyItems: ["Some Text Again", "Some More Text"],
    },
];

describe("pages", () => {
    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");

    vi.mock("../../data/dynamo", () => ({
        getDisruptionById: vi.fn(),
    }));

    MockDate.set("2023-05-22");

    afterAll(() => {
        MockDate.reset();
    });

    describe("DisruptionHistory", () => {
        it("should render correctly", () => {
            const tree = renderer
                .create(<DisruptionHistory disruptionId={DEFAULT_DISRUPTION_ID} history={history} />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });
    });

    describe("getServerSideProps", () => {
        it("should return correctly sorted history items", async () => {
            getDisruptionSpy.mockResolvedValue({
                ...disruptionWithConsequences,
                history: historyToSort,
            });
            const props = await getServerSideProps(getMockContext());

            expect(props).toEqual({
                props: {
                    disruptionId: disruptionWithConsequences.disruptionId,
                    history: [
                        {
                            datetime: "2023-05-19T14:40:00Z",
                            status: "PENDING_APPROVAL",
                            user: "Test User 1",
                            historyItems: ["Some Text"],
                        },
                        {
                            datetime: "2023-05-13T14:45:00Z",
                            status: "PUBLISHED",
                            user: "Test User 3",
                            historyItems: ["Some Text Again", "Some More Text"],
                        },
                        {
                            datetime: "2023-05-11T14:40:00Z",
                            status: "PENDING_APPROVAL",
                            user: "Test User 1",
                            historyItems: ["Some Text"],
                        },
                    ],
                },
            });
        });

        it("should add history item if disruption has closed", async () => {
            getDisruptionSpy.mockResolvedValue({
                ...disruptionWithConsequences,
                disruptionNoEndDateTime: "",
                disruptionEndDate: "20/05/2023",
                disruptionEndTime: "1200",
                publishEndDate: "20/05/2023",
                publishEndTime: "1200",
                history: historyToSort,
            });
            const props = await getServerSideProps(getMockContext());

            expect(props).toEqual({
                props: {
                    disruptionId: disruptionWithConsequences.disruptionId,
                    history: [
                        {
                            datetime: "2023-05-20T11:00:00.000Z",
                            historyItems: ["Changed status: Open to closed"],
                            status: "PUBLISHED",
                            user: "System",
                        },
                        {
                            datetime: "2023-05-19T14:40:00Z",
                            status: "PENDING_APPROVAL",
                            user: "Test User 1",
                            historyItems: ["Some Text"],
                        },
                        {
                            datetime: "2023-05-13T14:45:00Z",
                            status: "PUBLISHED",
                            user: "Test User 3",
                            historyItems: ["Some Text Again", "Some More Text"],
                        },
                        {
                            datetime: "2023-05-11T14:40:00Z",
                            status: "PENDING_APPROVAL",
                            user: "Test User 1",
                            historyItems: ["Some Text"],
                        },
                    ],
                },
            });
        });
    });
});
