import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { exportDisruption } from '../../testData/mockData';
import PDFRows from './PDFRows';

describe('PDFRows', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<PDFRows disruptions={exportDisruption} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
