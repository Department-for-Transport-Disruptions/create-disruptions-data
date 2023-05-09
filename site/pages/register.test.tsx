import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Register, { RegisterPageProps } from "./register.page";

const blankInputs: RegisterPageProps = {
    errors: [],
    inputs: {},
};

const withInputsAndNoErrors: RegisterPageProps = {
    errors: [],
    inputs: {
        email: "dummyUser@gmail.com",
        key: "key123",
        password: "dummyPassword",
        confirmPassword: "dummyPassword",
        organisation: "Test Org",
    },
};

const withInputsAndErrors: RegisterPageProps = {
    ...withInputsAndNoErrors,
    errors: [{ errorMessage: "Enter a valid email address", id: "email" }],
};

describe("register", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<Register {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and no errors", () => {
        const tree = renderer.create(<Register {...withInputsAndNoErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and with errors", () => {
        const tree = renderer.create(<Register {...withInputsAndErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
