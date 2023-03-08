import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Radios from "./Radios";
import { PageState } from "../../pages/create-disruption";

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

describe("Radios", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <Radios
                    heading="Type of disruption"
                    pageState={state}
                    inputInfo={[
                        {
                            id: "disruption-planned",
                            name: "disruptionType",
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            id: "disruption-unplanned",
                            name: "disruptionType",
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <Radios
                    heading="Type of disruption"
                    pageState={{ ...state, errors: [{ errorMessage: "There was an error", id: "disruption-planned" }] }}
                    inputInfo={[
                        {
                            id: "disruption-planned",
                            name: "disruptionType",
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            id: "disruption-unplanned",
                            name: "disruptionType",
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with a padding", () => {
        const tree = renderer
            .create(
                <Radios
                    heading="Type of disruption"
                    pageState={state}
                    inputInfo={[
                        {
                            id: "disruption-planned",
                            name: "disruptionType",
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            id: "disruption-unplanned",
                            name: "disruptionType",
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                    paddingTop={2}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
