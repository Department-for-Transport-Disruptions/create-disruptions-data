import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormElementWrapper from "./FormElementWrapper";

describe("FormElementWrapper", () => {
    it("should render correctly with no errors", () => {
        const { asFragment } = render(
            <FormElementWrapper errors={[]} errorId={""} errorClass={""}>
                <div />
            </FormElementWrapper>,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly around an input with errors", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
