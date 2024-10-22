import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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

afterEach(() => {
    cleanup();
});

describe("ForgotPassword", () => {
    it("should render correctly when there are no inputs", () => {
        const { asFragment } = render(<ForgotPassword {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs and no errors", () => {
        const { asFragment } = render(<ForgotPassword {...withInputsAndNoErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs and with errors", () => {
        const { asFragment } = render(<ForgotPassword {...withInputsAndErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
