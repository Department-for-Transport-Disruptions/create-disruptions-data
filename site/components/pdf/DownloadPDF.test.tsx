import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { exportDisruption } from '../../testData/mockData';
import DownloadPDF from './DownloadPDF';

describe('DownloadPDF', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<DownloadPDF disruptions={exportDisruption} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
