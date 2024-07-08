import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import AddUser, { AddUserPageProps } from "./add-user.page";

const blankInputs: AddUserPageProps = {
    inputs: {},
    errors: [],
};

const withInputs: AddUserPageProps = {
    inputs: {
        givenName: "dummy",
        familyName: "user",
        email: "dummy.user@gmail.com",
        group: UserGroups.orgAdmins,
    },
    errors: [],
};

describe("addUser", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<AddUser {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<AddUser {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
