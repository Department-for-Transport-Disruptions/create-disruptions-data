import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AddUser, { AddUserPageProps } from './add-user.page';

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

describe("AddUser", () => {
    it("should render correctly when there are no inputs", () => {
        const { asFragment } = render(<AddUser {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const { asFragment } = render(<AddUser {...withInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
