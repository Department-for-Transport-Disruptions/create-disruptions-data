import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UserManagement, { UserManagementPageProps } from './user-management.page';

const blankInputs: UserManagementPageProps = {
    userList: [],
};

const withInputs: UserManagementPageProps = {
    userList: [
        {
            givenName: "dummmy",
            familyName: "user",
            email: "dummy.user@gmail.com",
            userStatus: "CONFIRMED",
            group: UserGroups.orgAdmins,
            organisation: "admin",
            username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
            disruptionEmailPreference: "false",
            operatorOrgId: "N/A",
            streetManagerEmailPreference: "false",
        },
    ],
};

describe("UserManagement", () => {
    vi.mock("../../data/cognito", () => ({
        listUsersWithGroups: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should render correctly when there are no inputs", () => {
        const { asFragment } = render(<UserManagement {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const { asFragment } = render(<UserManagement {...withInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
