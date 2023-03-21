import { EnvironmentReason, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import ReviewDisruption from "./review-disruption.page";
import { SocialMediaPost } from "../interfaces/index";
import { Consequence } from "../schemas/consequence.schema";
import { Disruption } from "../schemas/create-disruption.schema";

const previousSocialMediaPosts: SocialMediaPost[] = [
    {
        messageToAppear: "The road is closed for the following reasons: Example, example, example, example",
        publishDate: "13/01/2022",
        publishTime: "13:00",
        accountToPublish: "Example account",
    },
    {
        messageToAppear: "The road is closed for the following reasons: Example, example, example, example",
        publishDate: "13/01/2022",
        publishTime: "13:00",
        accountToPublish: "Example account 2",
    },
];

const previousConsequencesInformation: Consequence[] = [
    {
        vehicleMode: VehicleMode.bus,
        consequenceType: "networkWide",
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "33",
        disruptionDirection: "inbound",
        disruptionSeverity: Severity.severe,
    },
    {
        vehicleMode: VehicleMode.tram,
        consequenceType: "operatorWide",
        consequenceOperator: "FSYO",
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "50",
        disruptionDirection: "inbound",
        disruptionSeverity: Severity.slight,
    },
    {
        vehicleMode: VehicleMode.bus,
        consequenceType: "services",
        services: [
            {
                id: "1",
                name: "Test",
            },
        ],
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "12",
        disruptionDirection: "outbound",
        disruptionSeverity: Severity.verySlight,
    },
];

const previousDisruptionInformation: Disruption = {
    disruptionType: "planned",
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
        {
            disruptionStartDate: "15/01/2022",
            disruptionStartTime: "1200",
            disruptionEndDate: "17/01/2022",
            disruptionEndTime: "1400",
            disruptionNoEndDateTime: "",
        },
    ],
    publishStartDate: "13/01/2022",
    publishStartTime: "1300",
    publishEndDate: "13/01/2022",
    publishEndTime: "1400",
};

describe("pages", () => {
    describe("ReviewDisruption", () => {
        it("should render correctly with inputs and no errors", () => {
            const tree = renderer
                .create(
                    <ReviewDisruption
                        previousDisruptionInformation={previousDisruptionInformation}
                        previousConsequencesInformation={previousConsequencesInformation}
                        previousSocialMediaPosts={previousSocialMediaPosts}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
