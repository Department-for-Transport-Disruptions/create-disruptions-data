import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import FormElementWrapper from "./FormElementWrapper";

describe("FormElementWrapper", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <FormElementWrapper errors={[]} errorId={""} errorClass={""}>
                    <div />
                </FormElementWrapper>,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly around an input with errors", () => {
        const tree = renderer
            .create(
                <FormElementWrapper
                    errors={[
                        {
                            errorMessage: "There was an error",
                            id: "test-div",
                        },
                    ]}
                    errorId={"test-div"}
                    errorClass={"govuk-input--error"}
                >
                    <input id="test-div" />
                </FormElementWrapper>,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
