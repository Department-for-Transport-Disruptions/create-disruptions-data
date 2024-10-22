import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockSessionWithOrgDetail } from "../testData/mockData";
import ChangePassword, { ChangePasswordPageProps } from "./change-password.page";

const blankInputs: ChangePasswordPageProps = {
    errors: [],
    inputs: {},
};

const withInputsAndNoErrors: ChangePasswordPageProps = {
    errors: [],
    inputs: {
        currentPassword: "dummyPassword",
        newPassword: "dummyPassword",
        confirmPassword: "dummyPassword",
    },
    sessionWithOrg: mockSessionWithOrgDetail,
};

const withInputsAndErrors: ChangePasswordPageProps = {
    ...withInputsAndNoErrors,
    errors: [{ errorMessage: "Enter a valid email address", id: "currentPassword" }],
};

const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

afterEach(cleanup);

describe("changePassword", () => {
    it("should render correctly when there are no inputs", () => {
        const { asFragment } = render(<ChangePassword {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs and no errors", () => {
        const { asFragment } = render(<ChangePassword {...withInputsAndNoErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs and with errors", () => {
        const { asFragment } = render(<ChangePassword {...withInputsAndErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when password is changed successfully", () => {
        useRouter.mockImplementation(() => ({
            query: { success: "true" },
        }));

        const { asFragment } = render(<ChangePassword {...withInputsAndErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
