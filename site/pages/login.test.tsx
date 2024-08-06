import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Login, { LoginPageProps } from './login.page';

const blankInputs: LoginPageProps = {
    errors: [],
    inputs: {},
};

const withInputsAndNoErrors: LoginPageProps = {
    errors: [],
    inputs: {
        email: "dummyUser@gmail.com",
        password: "dummyPassword",
    },
};

const withInputsAndErrors: LoginPageProps = {
    ...withInputsAndNoErrors,
    errors: [{ errorMessage: "Enter a valid email address", id: "email" }],
};

afterEach(() => {
    cleanup();
});

describe('Login', () => {
    it('should render correctly when there are no inputs', () => {
        const { asFragment } = render(<Login {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with inputs and no errors', () => {
        const { asFragment } = render(<Login {...withInputsAndNoErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with inputs and errors', () => {
        const { asFragment } = render(<Login {...withInputsAndErrors} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
