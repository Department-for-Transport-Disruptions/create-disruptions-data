import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Register, { RegisterPageProps } from './register.page';

const blankInputs: RegisterPageProps = {
    errors: [],
    inputs: {},
};

const withInputsAndNoErrors: RegisterPageProps = {
    errors: [],
    inputs: {
        email: "dummyUser@gmail.com",
        key: "key123",
        password: "dummyPassword",
        confirmPassword: "dummyPassword",
        organisationName: "Test Org",
    },
};

const withInputsAndErrors: RegisterPageProps = {
    ...withInputsAndNoErrors,
    errors: [{ errorMessage: "Enter a valid email address", id: "email" }],
};

afterEach(() => {
    cleanup();
});

describe('Register', () => {
    it('should render correctly when there are no inputs', () => {
        const { asFragment } = render(<Register {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with inputs and no errors', () => {
        const { asFragment } = render(<Register {...withInputsAndNoErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with inputs and errors', () => {
        const { asFragment } = render(<Register {...withInputsAndErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
