import renderer from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { TestInputs } from "../../interfaces";
import Radios from "./Radios";

describe("Radios", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <Radios<TestInputs>
                    display="Type of disruption"
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
                    inputName="field1"
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
                    inputName="field1"
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
                    inputName="field1"
                    stateUpdater={vi.fn()}
                    value={""}
                    paddingTop={2}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
