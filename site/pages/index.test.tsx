import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Index from './index.page';

afterEach(() => {
    cleanup();
});

describe('Index', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<Index />);
        expect(asFragment()).toMatchSnapshot();
    });
});
