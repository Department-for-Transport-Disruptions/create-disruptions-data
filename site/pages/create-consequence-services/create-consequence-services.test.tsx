import { Datasource, Severity } from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import renderer from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import { mockSessionWithOrgDetail } from "../../testData/mockData";
import CreateConsequenceServices, { CreateConsequenceServicesProps } from "./[disruptionId]/[consequenceIndex].page";

const blankInputs: CreateConsequenceServicesProps = {
    errors: [],
    inputs: {},
    sessionWithOrg: mockSessionWithOrgDetail,
    consequenceDataSource: null,
    globalDataSource: null,
    initialStops: [],
};

const withInputs: CreateConsequenceServicesProps = {
    disruptionDescription: "A truck broke down on a bridge",
    errors: [],
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    sessionWithOrg: mockSessionWithOrgDetail,
    inputs: {
        stops: [
            {
                atcoCode: "0100BRP90310",
                commonName: "Temple Meads Stn",
                indicator: "T3",
                latitude: 51.44901,
                longitude: -2.58569,
            },
            {
                atcoCode: "0100BRP90311",
                commonName: "Temple Meads Stn",
                indicator: "T7",
                latitude: 51.45014,
                longitude: -2.5856,
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
        disruptionDirection: "inbound",
    },
    consequenceDataSource: Datasource.bods,
    globalDataSource: Datasource.bods,
    initialStops: [],
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

const withInputsAndErrors: CreateConsequenceServicesProps = {
    disruptionDescription: "A truck broke down on a bridge",
    sessionWithOrg: mockSessionWithOrgDetail,
    errors: [
        { errorMessage: "Enter a description for this disruption", id: "description" },
        { errorMessage: "Select at least one option", id: "removeFromJourneyPlanners" },
    ],
    inputs: {
        stops: [
            {
                atcoCode: "0100BRP90310",
                commonName: "Temple Meads Stn",
                indicator: "T3",
                latitude: 51.44901,
                longitude: -2.58569,
            },
            {
                atcoCode: "0100BRP90311",
                commonName: "Temple Meads Stn",
                indicator: "T7",
                latitude: 51.45014,
                longitude: -2.5856,
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
    initialStops: [],
};

describe("pages", () => {
    describe("CreateConsequenceServices", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateConsequenceServices {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            useRouter.mockImplementation(() => ({
                query: { disruptionId: withInputs.disruptionId },
            }));
            const tree = renderer.create(<CreateConsequenceServices {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs and showUnderground is true", () => {
            const tree = renderer
                .create(<CreateConsequenceServices {...{ ...withInputs, showUnderground: true }} />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with errors and incorrect inputs", () => {
            const tree = renderer.create(<CreateConsequenceServices {...withInputsAndErrors} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: "/review-disruption", disruptionId: withInputs.disruptionId },
            }));
            const tree = renderer.create(<CreateConsequenceServices {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with appropriate buttons", () => {
            useRouter.mockImplementation(() => ({
                query: {
                    return: `${DISRUPTION_DETAIL_PAGE_PATH}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
                },
            }));
            const { queryAllByText, unmount } = render(<CreateConsequenceServices {...withInputs} />);

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
            const inputs: CreateConsequenceServicesProps = {
                ...withInputs,
                consequenceDataSource: Datasource.tnds,
            };
            const tree = renderer.create(<CreateConsequenceServices {...inputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
