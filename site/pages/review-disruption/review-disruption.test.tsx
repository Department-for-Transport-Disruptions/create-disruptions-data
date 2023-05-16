import { EnvironmentReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import ReviewDisruption from "./[disruptionId].page";
import { SocialMediaPost } from "../../interfaces/index";
import { Consequence } from "../../schemas/consequence.schema";
import { Disruption } from "../../schemas/disruption.schema";
import { Session } from "../../schemas/session.schema";
import { render } from "@testing-library/react";

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
        consequenceIndex: 0,
        disruptionId: "1",
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "33",
        disruptionSeverity: Severity.severe,
    },
    {
        vehicleMode: VehicleMode.tram,
        consequenceType: "operatorWide",
        consequenceIndex: 1,
        disruptionId: "1",
        consequenceOperators: ["FSYO"],
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "50",
        disruptionSeverity: Severity.slight,
    },
    {
        vehicleMode: VehicleMode.bus,
        consequenceType: "services",
        consequenceIndex: 2,
        disruptionId: "1",
        services: [
            {
                id: 23127,
                lineName: "1",
                operatorShortName: "First South Yorkshire",
                origin: "Jordanthorpe",
                destination: "HigH Green",
                nocCode: "TEST",
            },
        ],
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "12",
        disruptionSeverity: Severity.verySlight,
        disruptionDirection: "inbound",
    },
];

const previousDisruptionInformation: Disruption = {
    publishStatus: PublishStatus.draft,
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
    consequences: previousConsequencesInformation,
};

const userSession: Session = {
    username: "dummy.user@gmail.com",
    email: "dummy.user@gmail.com",
    orgId: randomUUID(),
    isSystemAdmin: true,
    isOrgAdmin: false,
    isOrgPublisher: false,
    isOrgStaff: false,
};

describe("pages", () => {
    describe("ReviewDisruption", () => {
        it("should render correctly with inputs and no errors", () => {
            const tree = renderer
                .create(
                    <ReviewDisruption
                        disruption={previousDisruptionInformation}
                        previousSocialMediaPosts={previousSocialMediaPosts}
                        errors={[]}
                        session={userSession}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs and display Send to review button for staff user role", () => {
            const { getAllByRole } = render(
                <ReviewDisruption
                    disruption={previousDisruptionInformation}
                    previousSocialMediaPosts={previousSocialMediaPosts}
                    errors={[]}
                    session={{ ...userSession, isSystemAdmin: false, isOrgStaff: true }}
                />,
            );

            const sendToReviewButton = getAllByRole("button", { name: "Send to review" });
            expect(sendToReviewButton).toBeTruthy();
        });

        it("should render correctly with inputs and display Publish disruption button for admin user role", () => {
            const { getAllByRole } = render(
                <ReviewDisruption
                    disruption={previousDisruptionInformation}
                    previousSocialMediaPosts={previousSocialMediaPosts}
                    errors={[]}
                    session={userSession}
                />,
            );

            const publishButton = getAllByRole("button", { name: "Publish disruption" });
            expect(publishButton).toBeTruthy();
        });
    });
});
