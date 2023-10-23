import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import UserDetailPageTemplate from "./UserDetailPageTemplate";
import { AddUserPageProps } from "../../pages/admin/add-user.page";
import { EditUserPageProps } from "../../pages/admin/edit-user/[username].page";

const editPageInputs = {
    title: "Edit User - Create Transport Disruptions Service",
    description: "Edit User page for the Create Transport Disruptions Service",
    props: {
        givenName: "test-given-name",
        familyName: "test-family-name",
        email: "test@test.com",
        orgId: "test-org",
        group: "org-staff",
        username: "test-username",
    },
};

const addUserPageState: AddUserPageProps = {
    errors: [],
    csrfToken: "test",
    inputs: {},
    operatorData: [
        { id: 123, nocCode: "TEST", operatorPublicName: "Test Operator" },
        { id: 456, nocCode: "DUMMY", operatorPublicName: "Dummy Operator" },
    ],
};

const editUserPageState: EditUserPageProps = {
    ...addUserPageState,
    inputs: {
        givenName: "test-given-name",
        familyName: "test-family-name",
        email: "test@test.com",
        orgId: "test-org",
        group: UserGroups.orgStaff,
        initialGroup: UserGroups.orgStaff,
        username: "test-username",
        operatorNocCodes: [{ id: 123, nocCode: "TEST", operatorPublicName: "Test Operator" }],
    },
};

const addUserPageInputs = {
    title: "Add User - Create Transport Disruptions Service",
    description: "Add User page for the Create Transport Disruptions Service",
};

describe("UserDetailPageTemplate", () => {
    const setPageState = vi.fn();

    it("should render the edit-user page correctly", () => {
        const tree = renderer
            .create(
                <UserDetailPageTemplate
                    pageType={"editUser"}
                    title={editPageInputs.title}
                    description={editPageInputs.description}
                    pageState={editUserPageState}
                    setPageState={setPageState}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
    it("should render the edit-user page correctly when operator group is selected", () => {
        const tree = renderer
            .create(
                <UserDetailPageTemplate
                    pageType={"editUser"}
                    title={editPageInputs.title}
                    description={editPageInputs.description}
                    pageState={{ ...editUserPageState, inputs: { group: UserGroups.operators } }}
                    setPageState={setPageState}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
    it("should render the add-user page correctly", () => {
        const tree = renderer
            .create(
                <UserDetailPageTemplate
                    pageType={"addUser"}
                    title={addUserPageInputs.title}
                    description={addUserPageInputs.description}
                    pageState={addUserPageState}
                    setPageState={setPageState}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
