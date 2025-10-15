import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ProjectPage from './Projects';
import styles from './projects.module.scss';

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

describe('Projects page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render projects heading and divider', () => {
        renderWithProviders(<ProjectPage />);

        expect(
            screen.getByRole('heading', { name: /projects/i }),
        ).toBeInTheDocument();
        expect(document.querySelector('.divider')).toBeInTheDocument();
    });

    it('should render the main projects container with correct class', () => {
        const { container } = renderWithProviders(<ProjectPage />);

        const mainElement = container.querySelector('main');
        expect(mainElement).toBeInTheDocument();
        expect(mainElement).toHaveClass(styles.projects);

        const projectsItemsContainer = container.querySelector(
            `.${styles.projectsItemsContainer}`,
        );
        expect(projectsItemsContainer).toBeInTheDocument();
    });

    it('should render all project items', () => {
        renderWithProviders(<ProjectPage />);

        const getHeading = (name: RegExp): HTMLElement =>
            screen.getByRole('heading', { level: 3, name });

        expect(getHeading(/reactplate/i)).toBeInTheDocument();
        expect(getHeading(/threshold-elgamal/i)).toBeInTheDocument();
        expect(getHeading(/sealed\.vote/i)).toBeInTheDocument();
        expect(getHeading(/expressplate/i)).toBeInTheDocument();
        expect(getHeading(/aliases\.sh/i)).toBeInTheDocument();
    });

    it('should include a divider between project items', () => {
        const { container } = renderWithProviders(<ProjectPage />);

        const dividers = container.querySelectorAll('.divider');

        expect(dividers.length).toBeGreaterThan(1);
    });
});
