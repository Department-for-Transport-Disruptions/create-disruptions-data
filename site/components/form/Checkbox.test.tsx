import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Checkbox from "./Checkbox";

interface PageInputs {
    field1: string;
    field2: boolean;
    field3: string;
    field4: string;
}

describe("Checkbox", () => {
    it("should render correctly when not default checked", () => {
        const { asFragment } = render(
            <Checkbox<PageInputs>
                inputName="field1"
                display="Display Legend"
                hideLegend
                checkboxDetail={[
                    {
                        display: "Radio Label",
                        value: "radioValue",
                        checked: false,
                    },
                ]}
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when default checked", () => {
        const { asFragment } = render(
            <Checkbox<PageInputs>
                inputName="field1"
                display="Display Legend"
                hideLegend
                checkboxDetail={[
                    {
                        display: "Radio Label",
                        value: "radioValue",
                        checked: true,
                    },
                ]}
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
