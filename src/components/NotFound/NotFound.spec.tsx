import { screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';

import NotFound from './NotFound';

import { renderWithProviders } from 'utils/testUtils';

describe('NotFound', () => {
    const route = '/invalid-path';

    it('should render the not found message with the current path', () => {
        const { container } = renderWithProviders(
            <MemoryRouter initialEntries={[route]}>
                <NotFound />
            </MemoryRouter>,
            { withRouter: false },
        );

        expect(container.textContent).toContain(`Path ${route} not found.`);

        const strongElement = screen.getByText(route);
        expect(strongElement).toBeInTheDocument();
    });

    it('should display the pathname in a strong element', () => {
        renderWithProviders(
            <MemoryRouter initialEntries={[route]}>
                <NotFound />
            </MemoryRouter>,
            { withRouter: false },
        );

        const strongElement = screen.getByText(route);
        expect(strongElement.tagName).toBe('STRONG');
    });
});
