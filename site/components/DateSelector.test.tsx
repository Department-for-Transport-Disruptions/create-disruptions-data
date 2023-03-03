import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import DateSelector from "./DateSelector";

describe("DateSelector", () => {
    it("should render correctly with no input", () => {
        const tree = renderer
            .create(
                <DateSelector
                    input={null}
                    disabled={false}
                    disablePast={false}
                    inputId={"publish-end-date"}
                    inputName={"publishStartDateDay"}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <DateSelector
                    input={null}
                    errors={[{ errorMessage: "There was an error", id: "publish-end-date" }]}
                    disabled={false}
                    disablePast={false}
                    inputId={"publish-end-date"}
                    inputName={"publishStartDateDay"}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with an input", () => {
        const tree = renderer
            .create(
                <DateSelector
                    input={new Date("01/01/2023")}
                    disabled={false}
                    disablePast={false}
                    inputId={"publish-end-date"}
                    inputName={"publishStartDateDay"}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when disabled", () => {
        const tree = renderer
            .create(
                <DateSelector
                    input={null}
                    disablePast={false}
                    inputId={"publish-end-date"}
                    inputName={"publishStartDateDay"}
                    disabled
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
