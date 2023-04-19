import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import ViewAllDisruptions, { getWorstSeverity, TableDisruption } from "./view-all-disruptions.page";

const disruptions: TableDisruption[] = [
    {
        id: "c58ba826-ac18-41c5-8476-8172dfa6ea24",
        summary: "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be...",
        validityPeriods: [{ startTime: "2022-01-05T04:42:17.239Z", endTime: null }],
        modes: [VehicleMode.tram],
        status: "Open",
        severity: "Very severe",
        serviceLineRefs: [],
        operators: [],
    },
    {
        id: "e234615d-8301-49c2-8143-1fca9dc187db",
        summary: "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be...",
        validityPeriods: [{ startTime: "2022-01-18T09:36:12.327Z", endTime: null }],
        modes: [VehicleMode.tram],
        status: "Open",
        severity: "Very severe",
        serviceLineRefs: [],
        operators: [],
    },
    {
        id: "dfd19560-99c1-4da6-8a73-de1220f37056",
        summary: "Busted reunion traffic",
        validityPeriods: [
            { startTime: "2022-01-19T11:41:12.445Z", endTime: "2022-01-26T11:41:12.445Z" },
            { startTime: "2023-04-14T04:21:29.085Z", endTime: null },
            { startTime: "2024-05-04T08:18:40.131Z", endTime: "2024-05-11T08:18:40.131Z" },
        ],
        modes: [VehicleMode.rail, VehicleMode.ferryService, VehicleMode.tram],
        status: "Approved draft",
        severity: "Very severe",
        serviceLineRefs: [],
        operators: [],
    },
];

const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("pages", () => {
    describe("viewAllDisruptions", () => {
        it("should render correctly when there are no disruptions", () => {
            const tree = renderer
                .create(<ViewAllDisruptions disruptions={[]} newDisruptionId={defaultNewDisruptionId} />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are enough disruptions for no pagination", () => {
            const tree = renderer
                .create(<ViewAllDisruptions disruptions={disruptions} newDisruptionId={defaultNewDisruptionId} />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly when there are enough disruptions for pagination", () => {
            const tree = renderer
                .create(
                    <ViewAllDisruptions
                        disruptions={[...disruptions, ...disruptions, ...disruptions, ...disruptions]}
                        newDisruptionId={defaultNewDisruptionId}
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
