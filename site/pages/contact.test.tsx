import { render, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import Contact from './contact.page';

describe('contact', () => {
    afterEach(cleanup);

    it('should render correctly', () => {
        const { asFragment } = render(<Contact />);
        expect(asFragment()).toMatchSnapshot();
    });
});
