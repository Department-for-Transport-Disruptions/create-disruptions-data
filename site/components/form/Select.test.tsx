import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Select from "./Select";
import { DISRUPTION_REASONS } from "../../constants";
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

describe("Select", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <Select
                    pageState={state}
                    inputInfo={{
                        id: "disruption-reason",
                        name: "disruptionReason",
                        display: "Reason for disruption",
                    }}
                    selectValues={DISRUPTION_REASONS}
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
                <Select
                    pageState={{ ...state, errors: [{ errorMessage: "There was an error", id: "disruption-reason" }] }}
                    inputInfo={{
                        id: "disruption-reason",
                        name: "disruptionReason",
                        display: "Reason for disruption",
                    }}
                    selectValues={DISRUPTION_REASONS}
                    updatePageState={() => {}}
                    updaterFunction={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
