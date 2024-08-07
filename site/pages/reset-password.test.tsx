import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResetPassword, { ResetPasswordPageProps } from "./reset-password.page";

const blankInputs: ResetPasswordPageProps = {
    errors: [],
    inputs: {},
};

const withInputsAndNoErrors: ResetPasswordPageProps = {
    errors: [],
    inputs: {
        email: "dummyUser@gmail.com",
        key: "key123",
        newPassword: "dummyPassword",
        confirmPassword: "dummyPassword",
    },
};

const withInputsAndErrors: ResetPasswordPageProps = {
    ...withInputsAndNoErrors,
    errors: [{ errorMessage: "Enter a valid email address", id: "email" }],
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");

beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

describe("ResetPassword", () => {
    it("should render correctly when there are no inputs", () => {
        const { asFragment } = render(<ResetPassword {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs and no errors", () => {
        const { asFragment } = render(<ResetPassword {...withInputsAndNoErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs and with errors", () => {
        const { asFragment } = render(<ResetPassword {...withInputsAndErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when password is changed successfully", () => {
        useRouter.mockImplementation(() => ({
            query: { success: "true" },
        }));
        const { asFragment } = render(<ResetPassword {...withInputsAndErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
