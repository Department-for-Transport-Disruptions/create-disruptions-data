import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import TimeSelector from "./TimeSelector";

describe("TimeSelector", () => {
    it("should render correctly with no inputs", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    errors={[]}
                    disabled={false}
                    inputId={"publish-start-time-input"}
                    inputName={"publishStartTime"}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    errors={[]}
                    input={"0900"}
                    disabled={false}
                    inputId={"publish-start-time-input"}
                    inputName={"publishStartTime"}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <TimeSelector
                    errors={[{ errorMessage: "There was an error", id: "publish-start-time-input" }]}
                    input={"0900"}
                    disabled={false}
                    inputId={"publish-start-time-input"}
                    inputName={"publishStartTime"}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
