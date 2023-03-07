import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import DateSelector from "./DateSelector";
import { PageState } from "../pages/create-disruption.page";

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

describe("DateSelector", () => {
    it("should render correctly with no input", () => {
        const tree = renderer
            .create(
                <DateSelector
                    input={null}
                    disabled={false}
                    disablePast={false}
                    inputId={"publish-end-date"}
                    inputName={"publishStartDateDay"}
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
                <DateSelector
                    input={null}
                    disabled={false}
                    disablePast={false}
                    inputId={"publish-end-date"}
                    inputName={"publishStartDateDay"}
                    pageState={{ ...blankInputs, errors: [{ id: "publish-end-date", errorMessage: "Select a date" }] }}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with an input", () => {
        const tree = renderer
            .create(
                <DateSelector
                    input={new Date("01/01/2023")}
                    disabled={false}
                    disablePast={false}
                    inputId={"publish-end-date"}
                    inputName={"publishStartDateDay"}
                    pageState={blankInputs}
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
                <DateSelector
                    input={null}
                    disablePast={false}
                    inputId={"publish-end-date"}
                    inputName={"publishStartDateDay"}
                    disabled
                    pageState={blankInputs}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
