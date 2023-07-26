import renderer from "react-test-renderer";
import { describe, it, vi, expect, beforeEach } from "vitest";
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = vi.spyOn(require("next/router"), "useRouter");

beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});
describe("reset-password", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<ResetPassword {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and no errors", () => {
        const tree = renderer.create(<ResetPassword {...withInputsAndNoErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and with errors", () => {
        const tree = renderer.create(<ResetPassword {...withInputsAndErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
    it("should render correctly when password is changed successfully", () => {
        useRouter.mockImplementation(() => ({
            query: { success: "true" },
        }));
        const tree = renderer.create(<ResetPassword {...withInputsAndErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
