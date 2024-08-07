import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Radios from "./Radios";
import { TestInputs } from "../../interfaces";

describe("Radios", () => {
    it("should render correctly with no errors", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with a padding", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
