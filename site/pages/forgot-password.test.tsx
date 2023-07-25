import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import ForgotPassword, { ForgotPasswordPageProps } from "./forgot-password.page";

const blankInputs: ForgotPasswordPageProps = {
    errors: [],
    inputs: {},
};

const withInputsAndNoErrors: ForgotPasswordPageProps = {
    errors: [],
    inputs: {
        email: "dummyUser@gmail.com",
    },
};

const withInputsAndErrors: ForgotPasswordPageProps = {
    ...withInputsAndNoErrors,
    errors: [{ errorMessage: "Enter an email address in the right format, name@example.com", id: "email" }],
};
describe("forgot-password", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<ForgotPassword {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and no errors", () => {
        const tree = renderer.create(<ForgotPassword {...withInputsAndNoErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and with errors", () => {
        const tree = renderer.create(<ForgotPassword {...withInputsAndErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
