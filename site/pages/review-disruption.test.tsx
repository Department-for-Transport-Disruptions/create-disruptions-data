import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import ReviewDisruption from "./review-disruption.page";
import { ConsequenceType, TransportMode } from "../constants/enum";
import { Consequence, Disruption, SocialMediaPost } from "../interfaces/index";

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
        "mode-of-transport": TransportMode.bus,
        "consequence-type": ConsequenceType.networkWide,
        "services-affected": [{ id: "1", name: "Piccadilly to Manchester central" }],
        "stops-affected": ["Shudehill SW", "Bolton NW", "Risehill SW", "Picadilly NE", "Noma NW"],
        "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
        "remove-from-journey-planners": "Yes",
        "disruption-delay": "35 minutes",
    },
    {
        "mode-of-transport": TransportMode.bus,
        "consequence-type": ConsequenceType.networkWide,
        "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
        "remove-from-journey-planners": "Yes",
        "disruption-delay": "35 minutes",
    },
    {
        "mode-of-transport": TransportMode.bus,
        "consequence-type": ConsequenceType.operatorWide,
        "consequence-operator": "Stagecoach",
        "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
        "remove-from-journey-planners": "Yes",
        "disruption-delay": "35 minutes",
    },
];

const previousDisruptionInformation: Disruption = {
    "type-of-disruption": "Planned",
    summary: "Road closure due to flooding and cattle on road and no sign of movement example example example etc etc",
    description:
        "Road closure due to flooding and cattle on road and no sign of movement example example example etc etc",
    "associated-link": "https://www.flooding.com",
    "disruption-reason": "Special event",
    "disruption-start-date": "13/01/2022",
    "disruption-start-time": "13/01/2022",
    "disruption-end-date": "14/01/2022",
    "disruption-end-time": "14:00",
    "disruption-repeats": "No",
    "publish-start-date": "13/01/2022",
    "publish-start-time": "1300",
    "publish-end-date": "13/01/2022",
    "publish-end-time": "14:00",
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
