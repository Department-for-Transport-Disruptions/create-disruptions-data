import { EnvironmentReason, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { upperFirst } from "lodash";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import ReviewDisruption from "./review-disruption.page";
import { Consequence, SocialMediaPost } from "../interfaces/index";
import { Disruption } from "../schemas/create-disruption.schema";

const previousSocialMediaPosts: SocialMediaPost[] = [
    {
        "message-to-appear": "The road is closed for the following reasons: Example, example, example, example",
        "publish-date": "13/01/2022",
        "publish-time": "13:00",
        "account-to-publish": "Example account",
    },
    {
        "message-to-appear": "The road is closed for the following reasons: Example, example, example, example",
        "publish-date": "13/01/2022",
        "publish-time": "13:00",
        "account-to-publish": "Example account 2",
    },
];

const previousConsequencesInformation: Consequence[] = [
    {
        "mode-of-transport": upperFirst(VehicleMode.bus),
        "consequence-type": "Network wide",
        "services-affected": [{ id: "1", name: "Piccadilly to Manchester central" }],
        "stops-affected": ["Shudehill SW", "Bolton NW", "Risehill SW", "Picadilly NE", "Noma NW"],
        "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
        "remove-from-journey-planners": "Yes",
        "disruption-delay": "35 minutes",
    },
    {
        "mode-of-transport": upperFirst(VehicleMode.bus),
        "consequence-type": "Network wide",
        "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
        "remove-from-journey-planners": "Yes",
        "disruption-delay": "35 minutes",
    },
    {
        "mode-of-transport": upperFirst(VehicleMode.bus),
        "consequence-type": "Operator wide",
        "consequence-operator": "Stagecoach",
        "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
        "remove-from-journey-planners": "Yes",
        "disruption-delay": "35 minutes",
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
