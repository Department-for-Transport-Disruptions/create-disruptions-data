import { Severity } from "@create-disruptions-data/shared-ts/enums";
import { render } from "@testing-library/react";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateTemplateConsequenceStops, { CreateConsequenceStopsProps } from "./[disruptionId]/[consequenceIndex].page";
import { defaultModes } from "../../schemas/organisation.schema";

const blankInputs: CreateConsequenceStopsProps = {
    errors: [],
    inputs: {},
};

const withInputs: CreateConsequenceStopsProps = {
    errors: [],
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
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
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
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
        name: "Test User",
        mode: defaultModes,
    },
    disruptionDescription: "A truck broke down on a bridge",
};

const withInputsAndErrors: CreateConsequenceStopsProps = {
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
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
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
        name: "Test User",
        mode: defaultModes,
    },
};

describe("pages", () => {
    describe("CreateTemplateConsequenceStops", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateTemplateConsequenceStops {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateTemplateConsequenceStops {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with errors and incorrect inputs", () => {
            const tree = renderer.create(<CreateTemplateConsequenceStops {...withInputsAndErrors} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            const tree = renderer.create(<CreateTemplateConsequenceStops {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with appropriate buttons", () => {
            const { queryAllByText, unmount } = render(<CreateTemplateConsequenceStops {...withInputs} />);

            const cancelButton = queryAllByText("Cancel Changes");
            const deleteButton = queryAllByText("Delete disruption");
            const saveAsDraftButton = queryAllByText("Save as draft");

            expect(cancelButton).toBeTruthy();
            expect(deleteButton).toBeTruthy();
            expect(saveAsDraftButton).toBeTruthy();

            unmount();
        });
    });
});
