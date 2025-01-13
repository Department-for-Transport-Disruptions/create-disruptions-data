import { Progress, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { render, waitFor } from "@testing-library/react";
import { Dayjs } from "dayjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getWorstSeverity, isClosingOrClosed } from "../pages/api/get-all-disruptions/[organisationId].api";
import { DEFAULT_ORG_ID, mockServices, mockViewAllDisruptionsData } from "../testData/mockData";
import ViewAllContents, { Filter, getApiUrlFromFilters } from "./ViewAllContents";

const disruptions = mockViewAllDisruptionsData;

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

            const { asFragment } = render(
                <ViewAllContents
                    newContentId={defaultNewDisruptionId}
                    adminAreaCodes={["099"]}
                    enableLoadingSpinnerOnPageLoad={false}
                    orgId={DEFAULT_ORG_ID}
                />,
            );

            await waitFor(() => {
                expect(asFragment()).toMatchSnapshot();
            });
        });

        it("should render correctly when there are enough disruptions for no pagination", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ disruptions }),
            } as unknown as Response);

            const { asFragment } = render(
                <ViewAllContents
                    newContentId={defaultNewDisruptionId}
                    adminAreaCodes={["099"]}
                    enableLoadingSpinnerOnPageLoad={false}
                    orgId={DEFAULT_ORG_ID}
                />,
            );

            await waitFor(() => {
                expect(asFragment()).toMatchSnapshot();
            });
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

            const { asFragment } = render(
                <ViewAllContents
                    newContentId={defaultNewDisruptionId}
                    adminAreaCodes={["099"]}
                    enableLoadingSpinnerOnPageLoad={false}
                    orgId={DEFAULT_ORG_ID}
                />,
            );

            await waitFor(() => {
                expect(asFragment()).toMatchSnapshot();
            });
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

            const { asFragment } = render(
                <ViewAllContents
                    newContentId={defaultNewDisruptionId}
                    adminAreaCodes={["099"]}
                    filterStatus={Progress.pendingApproval}
                    enableLoadingSpinnerOnPageLoad={false}
                    orgId={DEFAULT_ORG_ID}
                />,
            );

            await waitFor(() => {
                expect(asFragment()).toMatchSnapshot();
            });
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

            const { asFragment } = render(
                <ViewAllContents
                    newContentId={defaultNewDisruptionId}
                    adminAreaCodes={["099"]}
                    filterStatus={Progress.draft}
                    enableLoadingSpinnerOnPageLoad={false}
                    orgId={DEFAULT_ORG_ID}
                />,
            );

            await waitFor(() => {
                expect(asFragment()).toMatchSnapshot();
            });
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

describe("getApiUrlFromFilters", () => {
    it("correctly applies service filters to the query", () => {
        const filter: Filter = {
            services: [mockServices[0], mockServices[1]],
            operators: [],
        };

        const url = getApiUrlFromFilters("123", filter, 1, 10, false);

        expect(url).toBe(
            "/api/get-all-disruptions/123?services=bods:SL1,tnds:NW_04_SCMN_149_1&offset=0&pageSize=10&template=false",
        );
    });

    it("correctly applies operator filters to the query", () => {
        const filter: Filter = {
            services: [],
            operators: [
                {
                    operatorName: "Bobs Buses",
                    operatorRef: "BB",
                },
                {
                    operatorName: "Ben's Buses",
                    operatorRef: "BENS",
                },
            ],
        };
        const url = getApiUrlFromFilters("123", filter, 1, 10, false);

        expect(url).toBe("/api/get-all-disruptions/123?operators=BB,BENS&offset=0&pageSize=10&template=false");
    });

    it("correctly applies mode filters to the query", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            mode: VehicleMode.rail,
        };
        const url = getApiUrlFromFilters("123", filter, 1, 10, false);

        expect(url).toBe("/api/get-all-disruptions/123?mode=rail&offset=0&pageSize=10&template=false");
    });

    it("correctly applies severity filters to the query", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            severity: Severity.severe,
        };
        const url = getApiUrlFromFilters("123", filter, 1, 10, false);

        expect(url).toBe("/api/get-all-disruptions/123?severity=severe&offset=0&pageSize=10&template=false");
    });

    it("correctly applies status filters to the query", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            status: Progress.draft,
        };
        const url = getApiUrlFromFilters("123", filter, 1, 10, false);

        expect(url).toBe("/api/get-all-disruptions/123?status=draft&offset=0&pageSize=10&template=false");
    });

    it("correctly applies time period filters to the query", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            period: { startTime: "19-02-2021", endTime: "24-02-2021" },
        };
        const url = getApiUrlFromFilters("123", filter, 1, 10, false);

        expect(url).toBe(
            "/api/get-all-disruptions/123?startDate=19-02-2021&endDate=24-02-2021&offset=0&pageSize=10&template=false",
        );
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
