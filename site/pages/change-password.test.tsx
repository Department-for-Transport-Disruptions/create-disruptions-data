import renderer from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("changePassword", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<ChangePassword {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and no errors", () => {
        const tree = renderer.create(<ChangePassword {...withInputsAndNoErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs and with errors", () => {
        const tree = renderer.create(<ChangePassword {...withInputsAndErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when password is changed successfully", () => {
        useRouter.mockImplementation(() => ({
            query: { success: "true" },
        }));

        const tree = renderer.create(<ChangePassword {...withInputsAndErrors} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
