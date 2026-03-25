import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProjectItem from './ProjectItem';

import { renderWithProviders } from 'utils/testUtils';

const mockUseParams = vi.fn().mockReturnValue({ repo: 'test-repo' });

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');

    return {
        ...(actual as object),
        useParams: () => mockUseParams() as { repo?: string },
    };
});

describe('ProjectItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseParams.mockReturnValue({ repo: 'test-repo' });
    });

    it('renders the markdown content and navigation links', async () => {
        renderWithProviders(<ProjectItem />, { withRouter: true });

        expect(
            await screen.findByRole('heading', {
                level: 1,
                name: /test readme content/i,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /back to projects/i }),
        ).toHaveAttribute('href', '/projects/');
        expect(
            screen.getByRole('link', {
                name: /github\.com\/tenemo\/test-repo/i,
            }),
        ).toHaveAttribute('href', 'https://github.com/Tenemo/test-repo');
    });

    it('renders an error when the route param is missing', async () => {
        mockUseParams.mockReturnValue({});

        renderWithProviders(<ProjectItem />, { withRouter: true });

        expect(
            await screen.findByText(/error loading repository/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/repository information is missing/i),
        ).toBeInTheDocument();
    });

    it('renders an empty markdown area when repository content is missing', () => {
        mockUseParams.mockReturnValue({ repo: 'missing-repo' });

        renderWithProviders(<ProjectItem />, { withRouter: true });

        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { level: 1 }),
        ).not.toBeInTheDocument();
    });
});
