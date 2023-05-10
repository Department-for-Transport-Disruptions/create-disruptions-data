import { Severity } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateConsequenceServices, { CreateConsequenceServicesProps } from "./[disruptionId]/[consequenceIndex].page";

const blankInputs: CreateConsequenceServicesProps = {
    errors: [],
    inputs: {},
    sessionWithOrg: {
        email: "test@example.com",
        username: "Test",
        orgId: "org",
        adminAreaCodes: [],
        orgName: "Test Org",
        isOrgAdmin: true,
        isOrgPublisher: true,
        isOrgStaff: true,
        isSystemAdmin: true,
    },
};

const withInputs: CreateConsequenceServicesProps = {
    errors: [],
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    sessionWithOrg: {
        email: "test@example.com",
        username: "Test",
        orgId: "org",
        adminAreaCodes: [],
        orgName: "Test Org",
        isOrgAdmin: true,
        isOrgPublisher: true,
        isOrgStaff: true,
        isSystemAdmin: true,
    },
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
            },
        ],

        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
        disruptionDirection: "inbound",
    },
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

const withInputsAndErrors: CreateConsequenceServicesProps = {
    sessionWithOrg: {
        email: "test@example.com",
        username: "Test",
        orgId: "org",
        adminAreaCodes: [],
        orgName: "Test Org",
        isOrgAdmin: true,
        isOrgPublisher: true,
        isOrgStaff: true,
        isSystemAdmin: true,
    },
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
            },
        ],
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
};

describe("pages", () => {
    describe("CreateConsequenceServices", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateConsequenceServices {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateConsequenceServices {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with errors and incorrect inputs", () => {
            const tree = renderer.create(<CreateConsequenceServices {...withInputsAndErrors} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            useRouter.mockImplementation(() => ({
                query: { return: "/review-disruption" },
            }));
            const tree = renderer.create(<CreateConsequenceServices {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
