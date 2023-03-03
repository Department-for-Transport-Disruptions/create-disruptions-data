import * as React from "react";
import renderer from "react-test-renderer";
import FormElementWrapper from "./FormElementWrapper";
import { describe, it, expect } from "vitest";

describe("FormElementWrapper", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(<FormElementWrapper errors={[]} errorId={""} errorClass={""} children={<div></div>} />)
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
                    children={<input id="test-div"></input>}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
