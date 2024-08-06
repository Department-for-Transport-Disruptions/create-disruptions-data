import { render, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import CookieDetails from './cookie-details.page';

describe('pages', () => {
    describe('cookieDetails', () => {
        afterEach(cleanup);

        it('should render correctly', () => {
            const { asFragment } = render(<CookieDetails />);
            expect(asFragment()).toMatchSnapshot();
        });
    });
});
