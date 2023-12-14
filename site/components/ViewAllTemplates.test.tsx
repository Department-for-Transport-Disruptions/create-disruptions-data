import { Progress, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import renderer, { act } from "react-test-renderer";
import { describe, it, expect, vi, afterEach } from "vitest";
import ViewAllTemplates, { Filter, filterContents } from "./ViewAllTemplates";
import { getWorstSeverity, isClosingOrClosed } from "../pages/api/get-all-templates/[organisationId].api";
import { DEFAULT_ORG_ID, mockServices, mockViewAllDisruptionsData } from "../testData/mockData";

type Renderer = {
    toJSON: () => void;
};

const defaultRenderer: Renderer = {
    toJSON: () => {
        return;
    },
};

const templates = mockViewAllDisruptionsData;

const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const fetchSpy = vi.spyOn(global, "fetch");

afterEach(() => {
    vi.resetAllMocks();
});

describe("pages", () => {
    vi.mock("./ViewAllTemplates.page", async () => ({
        ...(await vi.importActual<object>("./ViewAllTemplates.page")),
    }));

    describe("ViewAllTemplates", () => {
        it("should render correctly when there are no templates", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ templates: [] }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllTemplates
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });

        it("should render correctly when there are enough templates for no pagination", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ templates }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllTemplates
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });

        it("should render correctly when there are enough templates for pagination", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({
                    templates: [
                        ...templates,
                        ...templates.map((d) => ({ ...d, id: `${d.id}1` })),
                        ...templates.map((d) => ({ ...d, id: `${d.id}2` })),
                        ...templates.map((d) => ({ ...d, id: `${d.id}3` })),
                    ],
                }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllTemplates
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
                    templates: [
                        ...templates,
                        ...templates.map((d) => ({ ...d, id: `${d.id}1` })),
                        ...templates.map((d) => ({ ...d, id: `${d.id}2` })),
                        ...templates.map((d) => ({ ...d, id: `${d.id}3` })),
                    ],
                }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllTemplates
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
                    templates: [
                        ...templates,
                        ...templates.map((d) => ({ ...d, id: `${d.id}1` })),
                        ...templates.map((d) => ({ ...d, id: `${d.id}2` })),
                        ...templates.map((d) => ({ ...d, id: `${d.id}3` })),
                    ],
                }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllTemplates
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
    it("correctly applies service filters to the templates", () => {
        const filter: Filter = {
            services: [mockServices[0]],
            operators: [],
        };
        const result = filterContents(templates, filter);
        expect(result).toStrictEqual([templates[0]]);
    });

    it("correctly applies different service filters to the templates", () => {
        const filterTwo: Filter = {
            services: [mockServices[1], mockServices[2]],
            operators: [],
        };
        const resultTwo = filterContents(templates, filterTwo);

        expect(resultTwo).toStrictEqual([templates[1], templates[2]]);
    });

    it("correctly applies operator filters to the templates", () => {
        const filter: Filter = {
            services: [],
            operators: [
                {
                    operatorName: "Bobs Buses",
                    operatorRef: "BB",
                },
            ],
        };
        const result = filterContents(templates, filter);
        expect(result).toStrictEqual([templates[0], templates[2]]);
    });

    it("correctly applies mode filters to the templates", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            mode: VehicleMode.rail,
        };
        const result = filterContents(templates, filter);
        expect(result).toStrictEqual([templates[2]]);
    });

    it("correctly applies severity filters to the templates", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            severity: Severity.severe,
        };
        const result = filterContents(templates, filter);
        expect(result).toStrictEqual([templates[2]]);
    });

    it("correctly applies status filters to the templates", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            status: Progress.draft,
        };
        const result = filterContents(templates, filter);
        expect(result).toStrictEqual([templates[2]]);
    });

    it("correctly applies time period filters to the templates, returning no templates if the period is before every disruption", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            period: { startTime: "19-02-2021", endTime: "24-02-2021" },
        };
        const result = filterContents(templates, filter);
        expect(result).toStrictEqual([]);
    });

    it("correctly applies time period filters to the templates, returning templates if the period is during a disruption", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            period: { startTime: "04-01-2022", endTime: "14-01-2022" },
        };
        const result = filterContents(templates, filter);
        expect(result).toStrictEqual([templates[0]]);
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
