import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateDisruption, { PageState } from "./create-disruption";

const blankInputs: PageState = {
    errors: [],
    inputs: {
        "type-of-disruption": "",
        summary: "",
        description: "",
        "associated-link": "",
        "disruption-reason": "",
        "disruption-repeats": "no",
        "disruption-start-date": "",
        "disruption-end-date": "",
        "disruption-start-time": "",
        "disruption-end-time": "",
        "disruption-no-end-date-time": "",
        "publish-start-date": "",
        "publish-end-date": "",
        "publish-start-time": "",
        "publish-end-time": "",
        "publish-no-end-date-time": "",
    },
};

const withInputs: PageState = {
    errors: [],
    inputs: {
        "type-of-disruption": "planned",
        summary: "New disruption",
        description: "A truck broke the bridge",
        "associated-link": "www.bbc.com",
        "disruption-reason": "routeDiversion",
        "disruption-start-date": "01/04/2023",
        "disruption-end-date": "01/08/2023",
        "disruption-start-time": "0100",
        "disruption-end-time": "0200",
        "disruption-repeats": "no",
        "disruption-no-end-date-time": "",
        "publish-start-date": "01/03/2023",
        "publish-end-date": "01/08/2023",
        "publish-start-time": "0200",
        "publish-end-time": "2300",
        "publish-no-end-date-time": "",
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
