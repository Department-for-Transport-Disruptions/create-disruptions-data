import { render, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ViewAllTemplates from './view-all-templates.page';
import { DEFAULT_ORG_ID, mockViewAllDisruptionsData } from '../testData/mockData';

const templates = mockViewAllDisruptionsData;
const defaultNewDisruptionId = 'acde070d-8c4c-4f0d-9d8a-162843c10333';

const fetchSpy = vi.spyOn(global, 'fetch');
const useRouter = vi.spyOn(require('next/router'), 'useRouter');

beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: '',
    }));
});

afterEach(() => {
    vi.resetAllMocks();
    cleanup();
});

describe('ViewAllTemplates', () => {
    it('should render correctly when there are no templates', async () => {
        fetchSpy.mockResolvedValue({
            json: vi.fn().mockResolvedValue({ disruptions: [] }),
        } as unknown as Response);

        const { asFragment } = render(
            <ViewAllTemplates
                newContentId={defaultNewDisruptionId}
                adminAreaCodes={['099']}
                enableLoadingSpinnerOnPageLoad={false}
                orgId={DEFAULT_ORG_ID}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly when there are enough disruptions for no pagination', async () => {
        fetchSpy.mockResolvedValue({
            json: vi.fn().mockResolvedValue({ disruptions: templates }),
        } as unknown as Response);

        const { asFragment } = render(
            <ViewAllTemplates
                newContentId={defaultNewDisruptionId}
                adminAreaCodes={['099']}
                enableLoadingSpinnerOnPageLoad={false}
                orgId={DEFAULT_ORG_ID}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly when there are enough templates for pagination', async () => {
        fetchSpy.mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                disruptions: [
                    ...templates,
                    ...templates.map((t) => ({ ...t, id: `${t.id}1` })),
                    ...templates.map((t) => ({ ...t, id: `${t.id}2` })),
                    ...templates.map((t) => ({ ...t, id: `${t.id}3` })),
                ],
            }),
        } as unknown as Response);

        const { asFragment } = render(
            <ViewAllTemplates
                newContentId={defaultNewDisruptionId}
                adminAreaCodes={['099']}
                enableLoadingSpinnerOnPageLoad={false}
                orgId={DEFAULT_ORG_ID}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
