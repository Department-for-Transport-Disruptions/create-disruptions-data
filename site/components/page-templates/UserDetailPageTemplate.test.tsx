import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserGroups } from '@create-disruptions-data/shared-ts/enums';
import { AddUserPageProps } from '../../pages/admin/add-user.page';
import { EditUserPageProps } from '../../pages/admin/edit-user/[username].page';
import UserDetailPageTemplate from './UserDetailPageTemplate';

const editPageInputs = {
    title: "Edit User - Create Transport Disruptions Service",
    description: "Edit User page for the Create Transport Disruptions Service",
};

const addUserPageState: AddUserPageProps = {
    errors: [],
    csrfToken: "test",
    inputs: {},
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
    },
};

const addUserPageInputs = {
    title: "Add User - Create Transport Disruptions Service",
    description: "Add User page for the Create Transport Disruptions Service",
};

describe('UserDetailPageTemplate', () => {
    const setPageState = vi.fn();

    it('should render the edit-user page correctly', () => {
        const { asFragment } = render(
            <UserDetailPageTemplate
                pageType="editUser"
                title={editPageInputs.title}
                description={editPageInputs.description}
                pageState={editUserPageState}
                setPageState={setPageState}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render the add-user page correctly', () => {
        const { asFragment } = render(
            <UserDetailPageTemplate
                pageType="addUser"
                title={addUserPageInputs.title}
                description={addUserPageInputs.description}
                pageState={addUserPageState}
                setPageState={setPageState}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
