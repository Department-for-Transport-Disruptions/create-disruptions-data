import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ExpiredLink from './expired-link.page';

afterEach(() => {
    cleanup();
});

describe('ExpiredLink', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<ExpiredLink />);
        expect(asFragment()).toMatchSnapshot();
    });
});
