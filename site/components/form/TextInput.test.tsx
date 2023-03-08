import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import TextInput from "./TextInput";
import { PageState } from "../../pages/create-disruption";

/* eslint-disable @typescript-eslint/no-empty-function */

const state: PageState = {
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

describe("TextInput", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <TextInput
                    pageState={state}
                    inputInfo={{
                        id: "summary",
                        name: "summary",
                        display: "Summary",
                    }}
                    widthClass="w-3/4"
                    maxLength={50}
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
                <TextInput
                    pageState={{ ...state, errors: [{ errorMessage: "There was an error", id: "summary" }] }}
                    inputInfo={{
                        id: "summary",
                        name: "summary",
                        display: "Summary",
                    }}
                    widthClass="w-3/4"
                    maxLength={50}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly as a text area with rows", () => {
        const tree = renderer
            .create(
                <TextInput
                    pageState={state}
                    inputInfo={{
                        id: "description",
                        name: "description",
                        display: "Description",
                    }}
                    widthClass="w-3/4"
                    maxLength={50}
                    textArea
                    rows={3}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
