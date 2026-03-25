import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, beforeEach } from 'vitest';

import App from './App';

import { renderApp } from 'utils/testing/renderApp';

describe('App', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: { pathname: '/' },
            writable: true,
        });
    });

    it('should render header and footer on all routes', () => {
        renderApp(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>,
            { withRouter: false },
        );

        const headerElement = screen.getByRole('banner');
        expect(headerElement).toBeInTheDocument();
        expect(screen.getByText('piech.dev')).toBeInTheDocument();

        const footerElement = screen.getByRole('contentinfo');
        expect(footerElement).toBeInTheDocument();
        const githubLink = screen.getByLabelText('GitHub repository');
        expect(githubLink).toBeInTheDocument();
    });
});
