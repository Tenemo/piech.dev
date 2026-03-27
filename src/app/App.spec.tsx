import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';

import { MAIN_CONTENT_ID } from './accessibility';
import App from './App';

import { renderApp } from 'utils/testing/renderApp';

describe('App', () => {
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

    it('targets the skip link at the current route instead of the base URL', () => {
        renderApp(
            <MemoryRouter initialEntries={['/projects/']}>
                <App />
            </MemoryRouter>,
            { withRouter: false },
        );

        expect(
            screen.getByRole('link', { name: /skip to main content/i }),
        ).toHaveAttribute('href', `/projects/#${MAIN_CONTENT_ID}`);
    });
});
