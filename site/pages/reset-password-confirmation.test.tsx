import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import ResetPasswordConfirmation, { ResetPasswordConfirmationProps } from "./reset-password-confirmation.page";

const blankInput: ResetPasswordConfirmationProps = {
    email: "",
};

const withInput: ResetPasswordConfirmationProps = {
    email: "dummyUser@gmail.com",
};

describe("reset-password-confirmation", () => {
    it("should render correctly when no input (i.e. email) is provided", () => {
        const tree = renderer.create(<ResetPasswordConfirmation {...blankInput} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with input (i.e. email)", () => {
        const tree = renderer.create(<ResetPasswordConfirmation {...withInput} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
