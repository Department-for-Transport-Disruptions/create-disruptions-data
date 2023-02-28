import * as React from 'react';
import renderer from 'react-test-renderer';
import Header from '../../components/layout/Header'
import {describe, it, expect} from 'vitest'

describe('Header', () => {
    it('should render correctly', () => {
        const tree = renderer.create(<Header isAuthed csrfToken="" noc={undefined} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
