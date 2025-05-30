import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import NotFound from './NotFound';

import { renderWithProviders } from 'utils/testUtils';

describe('NotFound', () => {
    const originalPathname = window.location.pathname;

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/invalid-path',
            },
            writable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname: originalPathname,
            },
            writable: true,
        });
    });

    it('should render the not found message with the current path', () => {
        const { container } = renderWithProviders(<NotFound />);

        expect(container.textContent).toContain(
            'Path /invalid-path not found.',
        );

        const strongElement = screen.getByText('/invalid-path');
        expect(strongElement).toBeInTheDocument();
    });

    it('should display the pathname in a strong element', () => {
        renderWithProviders(<NotFound />);

        const strongElement = screen.getByText('/invalid-path');
        expect(strongElement.tagName).toBe('STRONG');
    });
});
