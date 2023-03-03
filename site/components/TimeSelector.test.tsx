import * as React from "react";
import renderer from "react-test-renderer";
import TimeSelector from "./TimeSelector";
import { describe, it, expect } from "vitest";

describe("TimeSelector", () => {
    it("should render correctly with no inputs", () => {
        const tree = renderer.create(<TimeSelector startOrEnd={"start"} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    inputs={{
                        hourInput: "01",
                        minuteInput: "02",
                    }}
                    startOrEnd={"start"}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    inputs={{
                        hourInput: "d",
                        minuteInput: "02",
                    }}
                    startOrEnd={"start"}
                    errors={[
                        {
                            errorMessage: "Hour input needs to be a number",
                            id: "start-hour-input",
                            userInput: "d",
                        },
                    ]}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
