import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PDFHeader from './PDFHeader';

describe('PDFHeader', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<PDFHeader />);
        expect(asFragment()).toMatchSnapshot();
    });
});
