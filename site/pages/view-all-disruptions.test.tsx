import { Progress, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { Dayjs } from "dayjs";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ViewAllDisruptions, {
    disruptionIsClosingOrClosed,
    Filter,
    filterDisruptions,
    getWorstSeverity,
    TableDisruption,
} from "./view-all-disruptions.page";
import { mockServices } from "../testData/mockData";
import { getDatetimeFromDateAndTime } from "../utils/dates";

const disruptions: TableDisruption[] = [
    {
        id: "c58ba826-ac18-41c5-8476-8172dfa6ea24",
        summary: "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be...",
        validityPeriods: [{ startTime: "2022-01-05T04:42:17.239Z", endTime: null }],
        modes: ["Tram"],
        status: Progress.open,
        severity: Severity.verySevere,
        serviceIds: ["1212", "323"],
        operators: ["BB"],
        index: 0,
        isOperatorWideCq: true,
        isNetworkWideCq: true,
        isLive: true,
        stopsAffectedCount: 0,
        consequenceLength: 1,
    },
    {
        id: "e234615d-8301-49c2-8143-1fca9dc187db",
        summary: "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be...",
        validityPeriods: [{ startTime: "2022-01-18T09:36:12.327Z", endTime: null }],
        modes: ["Tram"],
        status: Progress.open,
        severity: Severity.verySevere,
        serviceIds: ["42545"],
        operators: ["DB"],
        index: 1,
        isOperatorWideCq: true,
        isNetworkWideCq: true,
        isLive: true,
        stopsAffectedCount: 0,
        consequenceLength: 1,
    },
    {
        id: "dfd19560-99c1-4da6-8a73-de1220f37056",
        summary: "Busted reunion traffic",
        validityPeriods: [
            { startTime: "2022-01-19T11:41:12.445Z", endTime: "2022-01-26T11:41:12.445Z" },
            { startTime: "2023-04-14T04:21:29.085Z", endTime: null },
            { startTime: "2024-05-04T08:18:40.131Z", endTime: "2024-05-11T08:18:40.131Z" },
        ],
        modes: ["Tram", "Ferry", "Train"],
        status: Progress.draft,
        severity: Severity.severe,
        serviceIds: ["6758"],
        operators: ["BB", "SB"],
        index: 2,
        isOperatorWideCq: true,
        isNetworkWideCq: true,
        isLive: true,
        stopsAffectedCount: 0,
        consequenceLength: 1,
    },
];

const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("pages", () => {
    describe("viewAllDisruptions", () => {
        it("should render correctly when there are no disruptions", () => {
            const tree = renderer
                .create(
                    <ViewAllDisruptions
                        disruptions={[]}
                        newDisruptionId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are enough disruptions for no pagination", () => {
            const tree = renderer
                .create(
                    <ViewAllDisruptions
                        disruptions={disruptions}
                        newDisruptionId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are enough disruptions for pagination", () => {
            const tree = renderer
                .create(
                    <ViewAllDisruptions
                        disruptions={[...disruptions, ...disruptions, ...disruptions, ...disruptions]}
                        newDisruptionId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when filter is set to pending approval status", () => {
            useRouter.mockImplementation(() => ({
                query: { pending: true },
            }));

            const tree = renderer
                .create(
                    <ViewAllDisruptions
                        disruptions={[...disruptions, ...disruptions, ...disruptions, ...disruptions]}
                        newDisruptionId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
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

describe("filterDisruptions", () => {
    it("correctly applies service filters to the disruptions", () => {
        const filter: Filter = {
            services: [mockServices[0]],
            operators: [],
        };
        const result = filterDisruptions(disruptions, filter);
        expect(result).toStrictEqual([disruptions[0]]);
    });

    it("correctly applies different service filters to the disruptions", () => {
        const filterTwo: Filter = {
            services: [mockServices[1], mockServices[2]],
            operators: [],
        };
        const resultTwo = filterDisruptions(disruptions, filterTwo);

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
        const result = filterDisruptions(disruptions, filter);
        expect(result).toStrictEqual([disruptions[0], disruptions[2]]);
    });

    it("correctly applies mode filters to the disruptions", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            mode: VehicleMode.rail,
        };
        const result = filterDisruptions(disruptions, filter);
        expect(result).toStrictEqual([disruptions[2]]);
    });

    it("correctly applies severity filters to the disruptions", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            severity: Severity.severe,
        };
        const result = filterDisruptions(disruptions, filter);
        expect(result).toStrictEqual([disruptions[2]]);
    });

    it("correctly applies status filters to the disruptions", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            status: Progress.draft,
        };
        const result = filterDisruptions(disruptions, filter);
        expect(result).toStrictEqual([disruptions[2]]);
    });

    it("correctly applies time period filters to the disruptions, returning no disruptions if the period is before every disruption", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            period: { startTime: "19-02-2021", endTime: "24-02-2021" },
        };
        const result = filterDisruptions(disruptions, filter);
        expect(result).toStrictEqual([]);
    });

    it("correctly applies time period filters to the disruptions, returning disruptions if the period is during a disruption", () => {
        const filter: Filter = {
            services: [],
            operators: [],
            period: { startTime: "04-01-2022", endTime: "14-01-2022" },
        };
        const result = filterDisruptions(disruptions, filter);
        expect(result).toStrictEqual([disruptions[0]]);
    });
});

describe("disruptionIsClosingOrClosed", () => {
    it("should return closed for a disruption which has an end date that has passed", () => {
        const today: Dayjs = getDatetimeFromDateAndTime("04/04/2023", "1000");
        const disruptionEndDate: Dayjs = getDatetimeFromDateAndTime("04/04/2023", "0700");
        const result = disruptionIsClosingOrClosed(disruptionEndDate, today);

        expect(result).toEqual("closed");
    });

    it("should return closing for a disruption which has an end date within 24 hours of today", () => {
        const today: Dayjs = getDatetimeFromDateAndTime("03/04/2023", "2200");
        const disruptionEndDate: Dayjs = getDatetimeFromDateAndTime("04/04/2023", "0700");
        const result = disruptionIsClosingOrClosed(disruptionEndDate, today);

        expect(result).toEqual("closing");
    });
});
