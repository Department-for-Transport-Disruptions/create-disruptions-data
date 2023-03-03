import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import TimeSelector from "./TimeSelector";

describe("TimeSelector", () => {
    it("should render correctly with no inputs", () => {
        const tree = renderer.create(<TimeSelector startOrEnd={"start"} type="validity" />).toJSON();
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
                    type="publish"
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
                    type="validity"
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
