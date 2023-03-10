import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import Radios from "./Radios";
import { TestInputs } from "../../interfaces";

describe("Radios", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <Radios<TestInputs>
                    display="Type of disruption"
                    inputId="field1"
                    radioDetail={[
                        {
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                    inputName="typeOfDisruption"
                    stateUpdater={vi.fn()}
                    value={""}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <Radios<TestInputs>
                    display="Type of disruption"
                    inputId="field1"
                    initialErrors={[{ errorMessage: "There was an error", id: "field1" }]}
                    radioDetail={[
                        {
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                    inputName="typeOfDisruption"
                    stateUpdater={vi.fn()}
                    value={""}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with a padding", () => {
        const tree = renderer
            .create(
                <Radios<TestInputs>
                    display="Type of disruption"
                    inputId="field1"
                    radioDetail={[
                        {
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                    inputName="typeOfDisruption"
                    stateUpdater={vi.fn()}
                    value={""}
                    paddingTop={2}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
