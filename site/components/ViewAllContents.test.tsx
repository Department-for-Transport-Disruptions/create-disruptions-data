import { Progress, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import renderer, { act } from "react-test-renderer";
import { describe, it, expect, vi, afterEach } from "vitest";
import ViewAllContents, { Filter, TableContents, filterContents } from "./ViewAllContents";
import { getWorstSeverity, isClosingOrClosed } from "../pages/api/get-all-disruptions/[organisationId].api";
import { DEFAULT_ORG_ID, mockServices, mockViewAllDisruptionsData } from "../testData/mockData";

type Renderer = {
    toJSON: () => void;
};

const defaultRenderer: Renderer = {
    toJSON: () => {
        return;
    },
};

const disruptions: TableContents[] = mockViewAllDisruptionsData;

const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const fetchSpy = vi.spyOn(global, "fetch");

afterEach(() => {
    vi.resetAllMocks();
});

describe("pages", () => {
    vi.mock("./ViewAllContents.page", async () => ({
        ...(await vi.importActual<object>("./ViewAllContents.page")),
    }));

    describe("ViewAllContents", () => {
        it("should render correctly when there are no disruptions", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ disruptions: [] }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllContents
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });

        it("should render correctly when there are enough disruptions for no pagination", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ disruptions }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllContents
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });

        it("should render correctly when there are enough disruptions for pagination", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({
                    disruptions: [
                        ...disruptions,
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}1` })),
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}2` })),
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}3` })),
                    ],
                }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllContents
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });

        it("should render correctly when filter is set to pending approval status", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({
                    disruptions: [
                        ...disruptions,
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}1` })),
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}2` })),
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}3` })),
                    ],
                }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllContents
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        filterStatus={Progress.pendingApproval}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });

        it("should render correctly when filter is set to draft status", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({
                    disruptions: [
                        ...disruptions,
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}1` })),
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}2` })),
                        ...disruptions.map((d) => ({ ...d, id: `${d.id}3` })),
                    ],
                }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllContents
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        filterStatus={Progress.draft}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });
    });
});

describe("getWorstSeverity", () => {
    it("returns the worst severity when given multiple", () => {
        const severitys: Severity[] = [Severity.normal, Severity.unknown, Severity.verySevere];
        const result = getWorstSeverity(severitys);
        expect(result).toBe("verySevere");
    });
});

describe("filterContents", () => {
    it("correctly applies service filters to the disruptions", () => {
        const filter: Filter = {
            services: [mockServices[0]],
            operators: [],
        };
        const result = filterContents(disruptions, filter);
        expect(result).toStrictEqual([disruptions[0]]);
    });

    it("correctly applies different service filters to the disruptions", () => {
        const filterTwo: Filter = {
            services: [mockServices[1], mockServices[2]],
            operators: [],
        };
        const resultTwo = filterContents(disruptions, filterTwo);

        expect(resultTwo).toStrictEqual([disruptions[0], disruptions[2]]);
    });

    it("correctly applies operator filters to the disruptions", () => {
        const filter: Filter = {
            services: [],
            operators: [
                {
                    operatorName: "Bobs Buses",
                    operatorRef: "BB",
                },
            ],
        };
        const result = filterContents(disruptions, filter);
        expect(result).toStrictEqual([disruptions[0], disruptions[2]]);
    });

    it("correctly applies mode filters to the disruptions", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            mode: VehicleMode.rail,
        };
        const result = filterContents(disruptions, filter);
        expect(result).toStrictEqual([disruptions[2]]);
    });

    it("correctly applies severity filters to the disruptions", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            severity: Severity.severe,
        };
        const result = filterContents(disruptions, filter);
        expect(result).toStrictEqual([disruptions[2]]);
    });

    it("correctly applies status filters to the disruptions", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            status: Progress.draft,
        };
        const result = filterContents(disruptions, filter);
        expect(result).toStrictEqual([disruptions[2]]);
    });

    it("correctly applies time period filters to the disruptions, returning no disruptions if the period is before every disruption", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            period: { startTime: "19-02-2021", endTime: "24-02-2021" },
        };
        const result = filterContents(disruptions, filter);
        expect(result).toStrictEqual([]);
    });

    it("correctly applies time period filters to the disruptions, returning disruptions if the period is during a disruption", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            period: { startTime: "04-01-2022", endTime: "14-01-2022" },
        };
        const result = filterContents(disruptions, filter);
        expect(result).toStrictEqual([disruptions[0]]);
    });
});

describe("isClosingOrClosed", () => {
    it("should return closed for a disruption which has an end date that has passed", () => {
        const today: Dayjs = getDatetimeFromDateAndTime("04/04/2023", "1000");
        const disruptionEndDate: Dayjs = getDatetimeFromDateAndTime("04/04/2023", "0700");
        const result = isClosingOrClosed(disruptionEndDate, today);

        expect(result).toEqual("closed");
    });

    it("should return closing for a disruption which has an end date within 24 hours of today", () => {
        const today: Dayjs = getDatetimeFromDateAndTime("03/04/2023", "2200");
        const disruptionEndDate: Dayjs = getDatetimeFromDateAndTime("04/04/2023", "0700");
        const result = isClosingOrClosed(disruptionEndDate, today);

        expect(result).toEqual("closing");
    });
});
