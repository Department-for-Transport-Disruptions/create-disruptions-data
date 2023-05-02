import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Login, { LoginPageProps } from "./login.page";

const blankInputs: LoginPageProps = {
    errors: [],
    inputs: {},
};

const withInputsAndNoErrors: LoginPageProps = {
    errors: [],
    inputs: {
        email: "dummyUser@gmail.com",
        password: "dummyPassword",
    },
};

const withInputsAndErrors: LoginPageProps = {
    ...withInputsAndNoErrors,
    errors: [{ errorMessage: "Enter an email address", id: "email" }],
};

describe("login", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<Login {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and no errors", () => {
        const tree = renderer.create(<Login {...withInputsAndNoErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and with errors", () => {
        const tree = renderer.create(<Login {...withInputsAndErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
