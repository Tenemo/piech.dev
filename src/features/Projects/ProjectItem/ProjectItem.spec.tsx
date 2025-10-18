import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
        console.error = vi.fn();
        document.title = '';
    });

    it('should render with the correct structure when data is loaded', async () => {
        renderWithProviders(<ProjectItem />, { withRouter: true });

        const headingElement = await screen.findByRole('heading', { level: 1 });
        expect(headingElement).toHaveTextContent('Test Readme Content');

        expect(screen.getByText(/back to projects/i)).toBeInTheDocument();
        expect(
            screen.getByText(/github.com\/tenemo\/test-repo/i),
        ).toBeInTheDocument();
    });

    it('should not show loading state (static content)', () => {
        renderWithProviders(<ProjectItem />, { withRouter: true });
        expect(
            screen.queryByText(/loading repository information/i),
        ).not.toBeInTheDocument();
    });

    it('should display error message when fetch fails', () => {
        renderWithProviders(<ProjectItem />, { withRouter: true });
        // static content has no fetch errors
        expect(
            screen.queryByText(/error loading repository/i),
        ).not.toBeInTheDocument();
    });

    it('should display error message when response is not ok', () => {
        renderWithProviders(<ProjectItem />, { withRouter: true });
        expect(
            screen.queryByText(/failed to fetch readme/i),
        ).not.toBeInTheDocument();
    });

    it('should use cached readme content when available', async () => {
        mockUseParams.mockReturnValue({ repo: 'cached-project' });
        const { rerender } = renderWithProviders(<ProjectItem />, {
            withRouter: true,
        });

        const firstHeading = await screen.findByRole('heading', { level: 1 });
        expect(firstHeading).toHaveTextContent('Cached Readme Content');

        mockUseParams.mockReturnValue({ repo: 'test-repo' });

        rerender(<ProjectItem />);

        mockUseParams.mockReturnValue({ repo: 'cached-project' });

        rerender(<ProjectItem />);

        await screen.findByRole('heading', { level: 1 });
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Cached Readme Content',
        );
    });

    it('should save readme content to context', async () => {
        mockUseParams.mockReturnValue({ repo: 'new-content-project' });
        const { rerender } = renderWithProviders(<ProjectItem />, {
            withRouter: true,
        });

        const firstHeading = await screen.findByRole('heading', { level: 1 });
        expect(firstHeading).toHaveTextContent('New Readme Content');

        mockUseParams.mockReturnValue({ repo: 'test-repo' });

        rerender(<ProjectItem />);

        mockUseParams.mockReturnValue({ repo: 'new-content-project' });

        rerender(<ProjectItem />);

        await screen.findByRole('heading', { level: 1 });
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'New Readme Content',
        );
    });

    it('should handle case when repo parameter is missing', async () => {
        mockUseParams.mockReturnValue({});

        renderWithProviders(<ProjectItem />, { withRouter: true });

        const errorHeading = await screen.findByText(
            /error loading repository/i,
        );
        expect(errorHeading).toBeInTheDocument();

        const errorMessage = await screen.findByText(
            /repository information is missing/i,
        );
        expect(errorMessage).toBeInTheDocument();
    });

    it('should have correct GitHub link', () => {
        renderWithProviders(<ProjectItem />, { withRouter: true });

        const githubLink = screen.getByRole('link', {
            name: /github\.com\/tenemo\/test-repo/i,
        });

        expect(githubLink).toHaveAttribute(
            'href',
            'https://github.com/tenemo/test-repo',
        );
        expect(githubLink).toHaveAttribute('target', '_blank');
        expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    // Title/meta are provided by route module meta() in framework mode; component doesn't set them.
});
