import * as React from 'react';
import renderer from 'react-test-renderer';
import Layout from '../../components/layout/Layout';
import {describe, it, expect} from 'vitest'

describe('Layout', () => {
    it('should render correctly', () => {
        const tree = renderer.create(<Layout title="title" description="description" />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
