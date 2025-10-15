import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Portfolio from './Portfolio';
import styles from './portfolio.module.scss';

import { renderWithProviders } from 'utils/testUtils';

vi.mock('global', async () => {
    const actual = await vi.importActual('global');
    return {
        ...(actual as object),
        fetch: vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        name: 'test-package',
                        description: 'Test description',
                    }),
            }),
        ),
    };
});

describe('Portfolio', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render projects heading and divider', () => {
        renderWithProviders(<Portfolio />);

        expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
        expect(document.querySelector('.divider')).toBeInTheDocument();
    });

    it('should render the main portfolio container with correct class', () => {
        const { container } = renderWithProviders(<Portfolio />);

        const mainElement = container.querySelector('main');
        expect(mainElement).toBeInTheDocument();
        expect(mainElement).toHaveClass(styles.portfolio);

        const portfolioItemsContainer = container.querySelector(
            `.${styles.portfolioItemsContainer}`,
        );
        expect(portfolioItemsContainer).toBeInTheDocument();
    });

    it('should render all portfolio items', () => {
        renderWithProviders(<Portfolio />);

        const getHeading = (name: RegExp): HTMLElement =>
            screen.getByRole('heading', { level: 3, name });

        expect(getHeading(/reactplate/i)).toBeInTheDocument();
        expect(getHeading(/threshold-elgamal/i)).toBeInTheDocument();
        expect(getHeading(/sealed\.vote/i)).toBeInTheDocument();
        expect(getHeading(/expressplate/i)).toBeInTheDocument();
        expect(getHeading(/aliases\.sh/i)).toBeInTheDocument();
    });

    it('should include a divider between portfolio items', () => {
        const { container } = renderWithProviders(<Portfolio />);

        const dividers = container.querySelectorAll('.divider');

        expect(dividers.length).toBeGreaterThan(1);
    });
});
