import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ResetPasswordConfirmation, { ResetPasswordConfirmationProps } from './reset-password-confirmation.page';

const blankInput: ResetPasswordConfirmationProps = {
    email: "",
};

const withInput: ResetPasswordConfirmationProps = {
    email: "dummyUser@gmail.com",
};

afterEach(() => {
    cleanup();
});

describe('ResetPasswordConfirmation', () => {
    it('should render correctly when no input (i.e. email) is provided', () => {
        const { asFragment } = render(<ResetPasswordConfirmation {...blankInput} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with input (i.e. email)', () => {
        const { asFragment } = render(<ResetPasswordConfirmation {...withInput} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
