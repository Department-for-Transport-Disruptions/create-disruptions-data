import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateTemplate from "./[templateId].page";
import { DisruptionPageProps } from "../create-disruption/[disruptionId].page";

const blankInputs: DisruptionPageProps = {
    errors: [],
    inputs: {},
};

const withInputs: DisruptionPageProps = {
    errors: [],
    disruptionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    inputs: {
        disruptionType: "planned",
        summary: "New disruption",
        description: "A truck broke the bridge",
        associatedLink: "www.bbc.com",
        disruptionReason: MiscellaneousReason.routeDiversion,
        validity: [
            {
                disruptionStartDate: "01/04/2023",
                disruptionEndDate: "03/04/2023",
                disruptionStartTime: "0100",
                disruptionEndTime: "0200",
                disruptionNoEndDateTime: "",
            },
        ],
        disruptionStartDate: "10/03/2023",
        disruptionEndDate: "13/03/2023",
        disruptionStartTime: "0100",
        disruptionEndTime: "0200",
        disruptionNoEndDateTime: "",
        disruptionRepeats: "weekly",
        disruptionRepeatsEndDate: "30/03/2023",
        publishStartDate: "01/03/2023",
        publishEndDate: "01/08/2023",
        publishStartTime: "0200",
        publishEndTime: "2300",
    },
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("pages", () => {
    describe("CreateTemplate", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateTemplate {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateTemplate {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with query params", () => {
            const tree = renderer.create(<CreateTemplate {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});