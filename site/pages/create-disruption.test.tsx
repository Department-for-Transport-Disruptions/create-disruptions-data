import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateDisruption, { PageState } from "./create-disruption.page";

const blankInputs: PageState = {
    errors: [],
    inputs: {
        typeOfDisruption: "",
        summary: "",
        description: "",
        "associated-link": "",
        "disruption-reason": "",
        "disruption-start-date": null,
        "disruption-end-date": null,
        "disruption-start-time": "",
        "disruption-end-time": "",
        "publish-start-date": null,
        "publish-end-date": null,
        "publish-start-time": "",
        "publish-end-time": "",
    },
};

const withInputs: PageState = {
    errors: [],
    inputs: {
        typeOfDisruption: "planned",
        summary: "New disruption",
        description: "A truck broke the bridge",
        "associated-link": "www.bbc.com",
        "disruption-reason": "routeDiversion",
        "disruption-start-date": new Date("01/04/2023"),
        "disruption-end-date": new Date("01/08/2023"),
        "disruption-start-time": "0100",
        "disruption-end-time": "0200",
        "publish-start-date": new Date("01/03/2023"),
        "publish-end-date": new Date("01/08/2023"),
        "publish-start-time": "0200",
        "publish-end-time": "2300",
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
