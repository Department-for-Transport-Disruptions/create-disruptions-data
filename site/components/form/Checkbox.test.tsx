import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Checkbox from "./Checkbox";

/* eslint-disable @typescript-eslint/no-empty-function */

describe("Checkbox", () => {
    it("should render correctly when not default checked", () => {
        const tree = renderer
            .create(
                <Checkbox
                    inputInfo={{
                        id: "disruption-no-end-date-time",
                        name: "disruptionHasNoEndDateTime",
                        display: "No end date/time",
                        value: "checked",
                    }}
                    noDisruptionEndRequired={false}
                    updateNoDisruptionRequired={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when default checked", () => {
        const tree = renderer
            .create(
                <Checkbox
                    inputInfo={{
                        id: "disruption-no-end-date-time",
                        name: "disruptionHasNoEndDateTime",
                        display: "No end date/time",
                        value: "checked",
                    }}
                    noDisruptionEndRequired={true}
                    updateNoDisruptionRequired={() => {}}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
