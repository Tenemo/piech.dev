import { screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, beforeEach } from 'vitest';

import App from './App';

import { renderWithProviders } from 'utils/testUtils';

describe('App', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: { pathname: '/' },
            writable: true,
        });
    });

    it('should render header and footer on all routes', () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/about']}>
                <App />
            </MemoryRouter>,
            { withRouter: false },
        );

        const headerElement = screen.getByRole('banner');
        expect(headerElement).toBeInTheDocument();
        expect(screen.getByText('piech.dev')).toBeInTheDocument();

        const footerElement = screen.getByRole('contentinfo');
        expect(footerElement).toBeInTheDocument();
        const gitHubLink = screen.getByLabelText('GitHub repository');
        expect(gitHubLink).toBeInTheDocument();
    });
});
