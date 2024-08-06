import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { getMockContext } from '../testData/mockData';
import Feedback, { getServerSideProps } from './feedback.page';

afterEach(() => {
    cleanup();
});

describe('pages', () => {
    describe('feedback', () => {
        it('should render correctly when the page is first visited', () => {
            const { asFragment } = render(<Feedback feedbackSubmitted="false" csrfToken="" />);
            expect(asFragment()).toMatchSnapshot();
        });

        it('should render correctly after feedback has been successfully submitted', () => {
            const { asFragment } = render(<Feedback feedbackSubmitted="submitted" csrfToken="" />);
            expect(asFragment()).toMatchSnapshot();
        });

        it('should render correctly after the user tries to submit no feedback', () => {
            const { asFragment } = render(<Feedback feedbackSubmitted="not submitted" csrfToken="" />);
            expect(asFragment()).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            it('should return `feedbackSubmitted` as `false` when there is no query string', () => {
                const ctx = getMockContext();
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props.feedbackSubmitted).toBe('false');
            });

            it('should return `feedbackSubmitted` as `submitted` when the query string is `true`', () => {
                const ctx = getMockContext({ query: { feedbackSubmitted: 'true' } });
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props.feedbackSubmitted).toBe('submitted');
            });

            it('should return `feedbackSubmitted` as `not submitted` when the query string is not `true`', () => {
                const ctx = getMockContext({ query: { feedbackSubmitted: 'turkey' } });
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props.feedbackSubmitted).toBe('not submitted');
            });
        });
    });
});
