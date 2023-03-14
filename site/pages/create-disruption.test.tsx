import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateDisruption, { DisruptionPageState } from "./create-disruption.page";

const blankInputs: DisruptionPageState = {
    errors: [],
    inputs: {
        "type-of-disruption": "",
        summary: "",
        description: "",
        "associated-link": "",
        "disruption-reason": "",
        "disruption-start-date": "",
        "disruption-end-date": "",
        "disruption-start-time": "",
        "disruption-end-time": "",
        "publish-start-date": "",
        "publish-end-date": "",
        "publish-start-time": "",
        "publish-end-time": "",
        validity: [],
    },
};

const withInputs: DisruptionPageState = {
    errors: [],
    inputs: {
        "type-of-disruption": "planned",
        summary: "New disruption",
        description: "A truck broke the bridge",
        "associated-link": "www.bbc.com",
        "disruption-reason": MiscellaneousReason.routeDiversion,
        "disruption-start-date": "01/04/2023",
        "disruption-end-date": "01/08/2023",
        "disruption-start-time": "0100",
        "disruption-end-time": "0200",
        "publish-start-date": "01/03/2023",
        "publish-end-date": "01/08/2023",
        "publish-start-time": "0200",
        "publish-end-time": "2300",
        validity: [{ id: 1, value: "01/04/2023 0100 - 01/08/2023 0200" }],
    },
};

describe("pages", () => {
    describe("CreateDisruption", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateDisruption inputs={blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateDisruption inputs={withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
