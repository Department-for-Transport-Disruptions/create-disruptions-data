import { Datasource, Severity } from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import { mockSessionWithOrgDetail } from "../../testData/mockData";
import CreateConsequenceJourneys, { CreateConsequenceJourneysProps } from "./[disruptionId]/[consequenceIndex].page";

const blankInputs: CreateConsequenceJourneysProps = {
    errors: [],
    inputs: {},
    sessionWithOrg: mockSessionWithOrgDetail,
    consequenceDataSource: null,
    globalDataSource: null,
    selectedService: null,
    initialJourneys: [],
};

const withInputs: CreateConsequenceJourneysProps = {
    disruptionDescription: "A truck broke down on a bridge",
    errors: [],
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    sessionWithOrg: mockSessionWithOrgDetail,
    inputs: {
        journeys: [
            {
                dataSource: Datasource.bods,
                journeyCode: null,
                vehicleJourneyCode: "VJ24",
                departureTime: "17:30:00",
                destination: "Liverpool Sir Thomas Street",
                origin: "Chester Bus Interchange",
                direction: "outbound",
            },
            {
                dataSource: Datasource.bods,
                journeyCode: null,
                vehicleJourneyCode: "VJ25",
                departureTime: "18:00:00",
                destination: "Liverpool Sir Thomas Street",
                origin: "Chester Bus Interchange",
                direction: "outbound",
            },
        ],
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
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
    consequenceDataSource: Datasource.bods,
    globalDataSource: Datasource.bods,
    initialJourneys: [],
    selectedService: null,
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

const withInputsAndErrors: CreateConsequenceJourneysProps = {
    disruptionDescription: "A truck broke down on a bridge",
    sessionWithOrg: mockSessionWithOrgDetail,
    errors: [
        { errorMessage: "Enter a description for this disruption", id: "description" },
        { errorMessage: "Select at least one option", id: "removeFromJourneyPlanners" },
    ],
    inputs: {
        journeys: [
            {
                dataSource: Datasource.bods,
                journeyCode: null,
                vehicleJourneyCode: "VJ24",
                departureTime: "17:30:00",
                destination: "Liverpool Sir Thomas Street",
                origin: "Chester Bus Interchange",
                direction: "outbound",
            },
            {
                dataSource: Datasource.bods,
                journeyCode: null,
                vehicleJourneyCode: "VJ25",
                departureTime: "18:00:00",
                destination: "Liverpool Sir Thomas Street",
                origin: "Chester Bus Interchange",
                direction: "outbound",
            },
        ],
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
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
    consequenceDataSource: Datasource.bods,
    globalDataSource: Datasource.bods,
    initialJourneys: [],
    selectedService: null,
};

describe("pages", () => {
    describe("CreateConsequenceJourneys", () => {
        it("should render correctly with no inputs", () => {
            const { asFragment } = render(<CreateConsequenceJourneys {...blankInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            useRouter.mockImplementation(() => ({
                query: { disruptionId: withInputs.disruptionId },
            }));
            const { asFragment } = render(<CreateConsequenceJourneys {...withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and showUnderground is true", () => {
            const { asFragment } = render(<CreateConsequenceJourneys {...{ ...withInputs, showUnderground: true }} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with inputs and showCoach is true", () => {
            const { asFragment } = render(<CreateConsequenceJourneys {...{ ...withInputs, showCoach: true }} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with errors and incorrect inputs", () => {
            const { asFragment } = render(<CreateConsequenceJourneys {...withInputsAndErrors} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: "/review-disruption", disruptionId: withInputs.disruptionId },
            }));
            const { asFragment } = render(<CreateConsequenceJourneys {...withInputs} />);
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly with appropriate buttons", () => {
            useRouter.mockImplementation(() => ({
                query: {
                    return: `${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
                },
            }));
            const { queryAllByText, unmount } = render(<CreateConsequenceJourneys {...withInputs} />);

            const cancelButton = queryAllByText("Cancel Changes");
            const deleteButton = queryAllByText("Delete disruption");
            const saveAsDraftButton = queryAllByText("Save as draft");

            expect(cancelButton).toBeTruthy();
            expect(deleteButton).toBeTruthy();
            expect(saveAsDraftButton).toBeTruthy();

            unmount();
        });

        it("should render correctly when global datasource does not match consequence datasource", () => {
            useRouter.mockImplementation(() => ({
                query: { disruptionId: withInputs.disruptionId },
            }));
            const inputs: CreateConsequenceJourneysProps = {
                ...withInputs,
                consequenceDataSource: Datasource.tnds,
            };
            const { asFragment } = render(<CreateConsequenceJourneys {...inputs} />);
            expect(asFragment()).toMatchSnapshot();
        });
    });
});
