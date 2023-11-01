import { Consequence, Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { EnvironmentReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import ReviewConsequenceTable from "./ReviewConsequenceTable";
import { DEFAULT_ORG_ID } from "../testData/mockData";

const previousConsequencesInformation: Consequence = {
    vehicleMode: VehicleMode.bus,
    consequenceType: "networkWide",
    consequenceIndex: 0,
    disruptionId: "1",
    description: "The road is closed for the following reasons: Example, example, example, example",
    removeFromJourneyPlanners: "yes",
    disruptionDelay: "33",
    disruptionSeverity: Severity.severe,
};

const previousDisruptionInformation: Disruption = {
    disruptionType: "planned",
    disruptionId: "2",
    summary: "Road closure due to flooding and cattle on road and no sign of movement example example example etc etc",
    description:
        "Road closure due to flooding and cattle on road and no sign of movement example example example etc etc",
    associatedLink: "https://www.flooding.com",
    disruptionReason: EnvironmentReason.flooding,
    validity: [
        {
            disruptionStartDate: "13/01/2022",
            disruptionStartTime: "1200",
            disruptionEndDate: "14/01/2022",
            disruptionEndTime: "1400",
            disruptionNoEndDateTime: "",
        },
    ],
    publishStartDate: "13/01/2022",
    publishStartTime: "1300",
    publishEndDate: "13/01/2022",
    publishEndTime: "1400",
    disruptionStartDate: "15/01/2022",
    disruptionStartTime: "1200",
    disruptionEndDate: "17/01/2022",
    disruptionEndTime: "1400",
    disruptionNoEndDateTime: "",
    consequences: [previousConsequencesInformation],
    publishStatus: PublishStatus.draft,
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
};

describe("ReviewConsequenceTable", () => {
    it("should render the table with data", () => {
        const tree = renderer
            .create(
                <ReviewConsequenceTable
                    consequence={previousConsequencesInformation}
                    disruption={previousDisruptionInformation}
                    deleteActionHandler={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
