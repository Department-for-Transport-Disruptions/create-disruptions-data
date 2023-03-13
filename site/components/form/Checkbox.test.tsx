import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import Checkbox from "./Checkbox";

interface PageInputs {
    field1: string;
    field2: boolean;
    field3: string;
    field4: string;
}

describe("Checkbox", () => {
    it("should render correctly when not default checked", () => {
        const tree = renderer
            .create(
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
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when default checked", () => {
        const tree = renderer
            .create(
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
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
