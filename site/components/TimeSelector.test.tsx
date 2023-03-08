import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import TimeSelector from "./TimeSelector";
import { PageState } from "../pages/create-disruption";

/* eslint-disable @typescript-eslint/no-empty-function */

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

describe("TimeSelector", () => {
    it("should render correctly with no inputs", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    input={undefined}
                    disabled={false}
                    inputId={"publish-start-time"}
                    inputName={"publishStartTime"}
                    pageState={blankInputs}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    input={"0900"}
                    disabled={false}
                    inputId={"publish-start-time"}
                    inputName={"publishStartTime"}
                    pageState={blankInputs}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    input={""}
                    disabled={false}
                    inputId={"publish-start-time"}
                    inputName={"publishStartTime"}
                    pageState={{
                        ...blankInputs,
                        errors: [{ id: "publish-start-time", errorMessage: "Enter a time in hhmm format" }],
                    }}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when disabled", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    input={undefined}
                    disabled
                    inputId={"publish-start-time"}
                    inputName={"publishStartTime"}
                    pageState={blankInputs}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
