import { Consequence, ConsequenceOperators } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    Datasource,
    EnvironmentReason,
    PublishStatus,
    Severity,
    SocialMediaPostStatus,
    VehicleMode,
} from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReviewTemplate from "./[disruptionId].page";
import { FullDisruption } from "../../schemas/disruption.schema";
import { SocialMediaPost } from "../../schemas/social-media.schema";
import { DEFAULT_ORG_ID } from "../../testData/mockData";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const defaultConsequenceOperators: ConsequenceOperators[] = [
    {
        operatorNoc: "FMAN",
        operatorPublicName: "Another operator",
    },
];

const previousConsequencesInformation: Consequence[] = [
    {
        vehicleMode: VehicleMode.bus,
        consequenceType: "networkWide",
        consequenceIndex: 0,
        disruptionId: defaultDisruptionId,
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "33",
        disruptionSeverity: Severity.severe,
    },
    {
        vehicleMode: VehicleMode.tram,
        consequenceType: "operatorWide",
        consequenceIndex: 1,
        disruptionId: defaultDisruptionId,
        consequenceOperators: defaultConsequenceOperators,
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "50",
        disruptionSeverity: Severity.slight,
    },
    {
        vehicleMode: VehicleMode.bus,
        consequenceType: "services",
        consequenceIndex: 2,
        disruptionId: defaultDisruptionId,
        services: [
            {
                id: 23127,
                lineName: "1",
                operatorShortName: "First South Yorkshire",
                origin: "Jordanthorpe",
                destination: "HigH Green",
                nocCode: "TEST",
                startDate: "2023-07-23",
                serviceCode: "NW_04_SCMN_149_1",
                dataSource: Datasource.bods,
                lineId: "SL1",
                endDate: "2023-08-10",
            },
        ],
        description: "The road is closed for the following reasons: Example, example, example, example",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "12",
        disruptionSeverity: Severity.verySlight,
        disruptionDirection: "inbound",
    },
];

const previousCreateSocialMediaPostsInformation: SocialMediaPost[] = [
    {
        disruptionId: defaultDisruptionId,
        publishDate: "14/01/2027",
        publishTime: "1300",
        messageContent: "Test post 12345",
        socialAccount: "Twitter",
        hootsuiteProfile: "Twitter/1234",
        socialMediaPostIndex: 0,
        status: SocialMediaPostStatus.pending,
        accountType: "Hootsuite",
    },
    {
        disruptionId: defaultDisruptionId,
        publishDate: "14/01/2028",
        publishTime: "1300",
        messageContent: "Test post 12345",
        socialAccount: "Twitter",
        hootsuiteProfile: "Twitter/1234",
        socialMediaPostIndex: 1,
        status: SocialMediaPostStatus.pending,
        image: {
            filepath: "/testPath",
            key: "35bae327-4af0-4bbf-8bfa-2c085f214483/acde070d-8c4c-4f0d-9d8a-162843c10333/0.jpg",
            mimetype: "image/jpg",
            originalFilename: "blah.jpg",
            size: 1000,
        },
        accountType: "Hootsuite",
    },
    {
        disruptionId: defaultDisruptionId,
        messageContent: "Test twitter 12345",
        socialAccount: "Twitter",
        socialMediaPostIndex: 1,
        status: SocialMediaPostStatus.pending,
        accountType: "Twitter",
    },
];

const previousDisruptionInformation: FullDisruption = {
    publishStatus: PublishStatus.draft,
    disruptionType: "planned",
    disruptionId: defaultDisruptionId,
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
    socialMediaPosts: previousCreateSocialMediaPostsInformation,
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
};

describe("pages", () => {
    describe("ReviewTemplate", () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const useRouter = vi.spyOn(require("next/router"), "useRouter");
        beforeEach(() => {
            useRouter.mockImplementation(() => ({
                query: "",
            }));
        });
        it("should render correctly with inputs and no errors", () => {
            const tree = renderer
                .create(<ReviewTemplate disruption={previousDisruptionInformation} errors={[]} canPublish />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs and no errors when disruption is a template", () => {
            const tree = renderer
                .create(<ReviewTemplate disruption={{ ...previousDisruptionInformation }} errors={[]} canPublish />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs and no errors when disruption is a template with appropriate buttons", () => {
            const { queryByText, unmount } = render(
                <ReviewTemplate disruption={{ ...previousDisruptionInformation }} errors={[]} canPublish />,
            );

            const deleteTemplateButton = queryByText("Delete template", {
                selector: "button",
            });

            const header = queryByText("Review your answers before submitting the template");

            expect(deleteTemplateButton).toBeTruthy();
            expect(header).toBeTruthy();

            unmount();
        });

        it("should render correctly with inputs and no errors when disruption has no consequences", () => {
            const { queryByText, unmount } = render(
                <ReviewTemplate
                    disruption={{ ...previousDisruptionInformation, consequences: [] }}
                    errors={[]}
                    canPublish
                />,
            );
            const consequenceButton = queryByText("Add a consequence", {
                selector: "a",
            });

            expect(consequenceButton).toBeTruthy();
            unmount();
        });
    });
});
