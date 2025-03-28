import { Consequence, ConsequenceOperators } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    Datasource,
    EnvironmentReason,
    PublishStatus,
    Severity,
    SocialMediaPostStatus,
    VehicleMode,
} from "@create-disruptions-data/shared-ts/enums";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import { FullDisruption } from "../../schemas/disruption.schema";
import { SocialMediaPost } from "../../schemas/social-media.schema";
import { DEFAULT_OPERATOR_ORG_ID, DEFAULT_ORG_ID } from "../../testData/mockData";
import ReviewDisruption from "./[disruptionId].page";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const defaultConsequenceOperators: ConsequenceOperators[] = [
    {
        operatorNoc: "FMAN",
        operatorPublicName: "Another operator",
    },
];

afterEach(cleanup);

const journeyConsequence: Consequence = {
    vehicleMode: VehicleMode.bus,
    consequenceType: "journeys",
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
    journeys: [
        {
            dataSource: Datasource.bods,
            journeyCode: null,
            vehicleJourneyCode: "VJ1_053900",
            departureTime: "05:39:00",
            destination: "Liverpool Sir Thomas Street",
            origin: "Chester Bus Interchange",
            direction: "outbound",
        },
        {
            dataSource: Datasource.bods,
            journeyCode: null,
            vehicleJourneyCode: "VJ13_053900",
            departureTime: "05:39:00",
            destination: "Liverpool Sir Thomas Street",
            origin: "Chester Bus Interchange",
            direction: "outbound",
        },
    ],
};

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
    id: defaultDisruptionId,
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
    publishStartTime: "1100",
    publishEndDate: "18/01/2022",
    publishEndTime: "1400",
    disruptionStartDate: "15/01/2022",
    disruptionStartTime: "1200",
    disruptionEndDate: "17/01/2022",
    disruptionEndTime: "1400",
    validityStartTimestamp: "2022-01-13T12:00:00Z",
    validityEndTimestamp: "2022-01-17T14:00:00Z",
    publishStartTimestamp: "2022-01-13T11:00:00Z",
    publishEndTimestamp: "2022-01-18T14:00:00Z",
    disruptionNoEndDateTime: "",
    consequences: previousConsequencesInformation,
    socialMediaPosts: previousCreateSocialMediaPostsInformation,
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
    template: false,
};

describe("pages", () => {
    describe("ReviewDisruption", () => {
        const useRouter = vi.spyOn(require("next/router"), "useRouter");
        beforeEach(() => {
            useRouter.mockImplementation(() => ({
                query: "",
            }));
        });

        it("should render correctly with inputs and no errors", () => {
            const { asFragment } = render(
                <ReviewDisruption disruption={previousDisruptionInformation} errors={[]} canPublish redirect="" />,
            );

            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and display Send to review button for staff user role", () => {
            const { getAllByRole, unmount } = render(
                <ReviewDisruption
                    disruption={previousDisruptionInformation}
                    errors={[]}
                    canPublish={false}
                    redirect=""
                />,
            );

            const sendToReviewButton = getAllByRole("button", { name: "Send to review" });
            expect(sendToReviewButton).toBeTruthy();

            unmount();
        });

        it("should render correctly with inputs and display Publish disruption button for admin user role", () => {
            const { getAllByRole, unmount } = render(
                <ReviewDisruption disruption={previousDisruptionInformation} errors={[]} canPublish redirect="" />,
            );

            const publishButton = getAllByRole("button", { name: "Publish disruption" });
            expect(publishButton).toBeTruthy();

            unmount();
        });

        it("should render correctly with banner when disruption is a duplicate", () => {
            useRouter.mockImplementation(() => ({
                query: { duplicate: true },
            }));
            const { asFragment } = render(
                <ReviewDisruption disruption={previousDisruptionInformation} errors={[]} canPublish redirect="" />,
            );
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and no errors when disruption is a template", () => {
            const { asFragment } = render(
                <ReviewDisruption
                    disruption={{ ...previousDisruptionInformation, template: true }}
                    errors={[]}
                    canPublish
                    redirect=""
                />,
            );
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and no errors when disruption is a template with appropriate buttons", () => {
            const { queryByText, unmount, queryAllByText } = render(
                <ReviewDisruption
                    disruption={{ ...previousDisruptionInformation, template: true }}
                    errors={[]}
                    canPublish
                    redirect=""
                />,
            );

            const deleteTemplateButton = queryAllByText("Delete template", {
                selector: "button",
            })[0];

            const deleteButton = queryAllByText("Delete disruption", {
                selector: "button",
            })[0];

            const cancelButton = queryByText("Cancel all changes", {
                selector: "button",
            });

            const header = queryAllByText("Review your answers before submitting the template")[0];

            expect(deleteTemplateButton).toBeTruthy();
            expect(deleteButton).toBeFalsy();
            expect(header).toBeTruthy();
            expect(cancelButton).toBeFalsy();

            unmount();
        });

        it("should render correctly with appropriate buttons", () => {
            const { queryByText, unmount, queryAllByText } = render(
                <ReviewDisruption
                    disruption={previousDisruptionInformation}
                    errors={[]}
                    canPublish
                    redirect={`${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`}
                />,
            );

            const publishButton = queryAllByText("Publish disruption", {
                selector: "button",
            })[0];

            const draftButton = queryAllByText("Save as draft")[0];

            const deleteButton = queryAllByText("Delete disruption", {
                selector: "button",
            })[0];

            const deleteTemplateButton = queryAllByText("Delete template", {
                selector: "button",
            })[0];

            const cancelButton = queryByText("Cancel all changes", {
                selector: "button",
            });

            const header = queryAllByText("Review your answers before submitting the disruption")[0];

            expect(publishButton).toBeTruthy();
            expect(draftButton).toBeTruthy();
            expect(deleteButton).toBeTruthy();
            expect(header).toBeTruthy();
            expect(deleteTemplateButton).toBeFalsy();
            expect(cancelButton).toBeFalsy();

            unmount();
        });

        it("should render correctly with appropriate buttons for staff user", () => {
            const { queryByText, unmount, queryAllByText } = render(
                <ReviewDisruption
                    disruption={previousDisruptionInformation}
                    errors={[]}
                    canPublish={false}
                    redirect={`${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`}
                />,
            );

            const draftButton = queryAllByText("Save as draft")[0];

            const reviewButton = queryByText("Send to review", {
                selector: "button",
            });

            const deleteButton = queryAllByText("Delete disruption", {
                selector: "button",
            })[0];

            const deleteTemplateButton = queryAllByText("Delete template", {
                selector: "button",
            })[0];

            const cancelButton = queryByText("Cancel all changes", {
                selector: "button",
            });

            const header = queryAllByText("Review your answers before submitting the disruption")[0];

            expect(draftButton).toBeTruthy();
            expect(reviewButton).toBeTruthy();
            expect(deleteButton).toBeTruthy();
            expect(header).toBeTruthy();
            expect(deleteTemplateButton).toBeFalsy();
            expect(cancelButton).toBeFalsy();

            unmount();
        });

        it("should render correctly with inputs and no errors when disruption has no consequences", () => {
            const { queryByText, unmount } = render(
                <ReviewDisruption
                    disruption={{ ...previousDisruptionInformation, consequences: [] }}
                    errors={[]}
                    canPublish
                    redirect=""
                />,
            );
            const consequenceButton = queryByText("Add a consequence", {
                selector: "a",
            });

            expect(consequenceButton).toBeTruthy();
            unmount();
        });

        it("should render correctly with inputs and no errors if an operator is reviewing a disruption made by an LTA", () => {
            const { asFragment } = render(
                <ReviewDisruption
                    disruption={previousDisruptionInformation}
                    redirect={"/dashboard"}
                    errors={[]}
                    canPublish
                    operatorOrgId={DEFAULT_OPERATOR_ORG_ID}
                />,
            );
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and no errors if an operator is reviewing a disruption made by another operator who does not have the same operatorOrgId", () => {
            const { asFragment } = render(
                <ReviewDisruption
                    disruption={{
                        ...previousDisruptionInformation,
                        createdByOperatorOrgId: "e17489ff-779c-4e74-b5cb-623be0adf24f",
                    }}
                    redirect={"/dashboard"}
                    errors={[]}
                    canPublish
                    operatorOrgId={DEFAULT_OPERATOR_ORG_ID}
                />,
            );
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and no errors if a non-operator is reviewing an operator disruption", () => {
            const { asFragment } = render(
                <ReviewDisruption
                    disruption={{
                        ...previousDisruptionInformation,
                        createdByOperatorOrgId: "e17489ff-779c-4e74-b5cb-623be0adf24f",
                    }}
                    redirect={"/dashboard"}
                    errors={[]}
                    canPublish
                />,
            );
            expect(asFragment()).toMatchSnapshot();
        });
    });

    it("should render correctly with inputs and no errors when cancellations feature flag is set to true", () => {
        const disruption: FullDisruption = {
            ...previousDisruptionInformation,
            consequences: previousDisruptionInformation.consequences?.concat(journeyConsequence),
        };

        const { asFragment } = render(
            <ReviewDisruption
                disruption={disruption}
                errors={[]}
                canPublish
                redirect=""
                enableCancellationsFeatureFlag={true}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
