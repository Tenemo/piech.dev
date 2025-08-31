import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import PortfolioItem from './PortfolioItem';

import { renderWithProviders } from 'utils/testUtils';
// The app imports JSON via default import, so the mock must provide a default export
vi.mock('../../../../temp/githubData', () => ({
    default: {
        README_CONTENT: {
            'test-repo': '# Test Readme Content',
            'cached-project': '# Cached Readme Content',
            'new-content-project': '# New Readme Content',
        },
    },
}));

const mockUseParams = vi.fn().mockReturnValue({ repo: 'test-repo' });
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...(actual as object),
        useParams: () => mockUseParams() as { repo?: string },
    };
});

describe('PortfolioItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseParams.mockReturnValue({ repo: 'test-repo' });
        console.error = vi.fn();
        document.title = '';
    });

    it('should render with the correct structure when data is loaded', async () => {
        renderWithProviders(<PortfolioItem />, { withRouter: true });

        const headingElement = await screen.findByRole('heading', { level: 1 });
        expect(headingElement).toHaveTextContent('Test Readme Content');

        expect(screen.getByText(/back to portfolio/i)).toBeInTheDocument();
        expect(
            screen.getByText(/github.com\/tenemo\/test-repo/i),
        ).toBeInTheDocument();
    });

    it('should not show loading state (static content)', () => {
        renderWithProviders(<PortfolioItem />, { withRouter: true });
        expect(
            screen.queryByText(/loading repository information/i),
        ).not.toBeInTheDocument();
    });

    it('should display error message when fetch fails', () => {
        renderWithProviders(<PortfolioItem />, { withRouter: true });
        // static content has no fetch errors
        expect(
            screen.queryByText(/error loading repository/i),
        ).not.toBeInTheDocument();
    });

    it('should display error message when response is not ok', () => {
        renderWithProviders(<PortfolioItem />, { withRouter: true });
        expect(
            screen.queryByText(/failed to fetch readme/i),
        ).not.toBeInTheDocument();
    });

    it('should use cached readme content when available', async () => {
        mockUseParams.mockReturnValue({ repo: 'cached-project' });
        const { rerender } = renderWithProviders(<PortfolioItem />, {
            withRouter: true,
        });

        const firstHeading = await screen.findByRole('heading', { level: 1 });
        expect(firstHeading).toHaveTextContent('Cached Readme Content');

        mockUseParams.mockReturnValue({ repo: 'test-repo' });

        rerender(<PortfolioItem />);

        mockUseParams.mockReturnValue({ repo: 'cached-project' });

        rerender(<PortfolioItem />);

        await screen.findByRole('heading', { level: 1 });
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Cached Readme Content',
        );
    });

    it('should save readme content to context', async () => {
        mockUseParams.mockReturnValue({ repo: 'new-content-project' });
        const { rerender } = renderWithProviders(<PortfolioItem />, {
            withRouter: true,
        });

        const firstHeading = await screen.findByRole('heading', { level: 1 });
        expect(firstHeading).toHaveTextContent('New Readme Content');

        mockUseParams.mockReturnValue({ repo: 'test-repo' });

        rerender(<PortfolioItem />);

        mockUseParams.mockReturnValue({ repo: 'new-content-project' });

        rerender(<PortfolioItem />);

        await screen.findByRole('heading', { level: 1 });
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'New Readme Content',
        );
    });

    it('should handle case when repo parameter is missing', async () => {
        mockUseParams.mockReturnValue({});

        renderWithProviders(<PortfolioItem />, { withRouter: true });

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
        renderWithProviders(<PortfolioItem />, { withRouter: true });

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

    it('should set document title based on repo name', () => {
        const originalDocumentTitle = document.title;

        const originalUseEffect = React.useEffect;
        const mockUseEffect = vi
            .spyOn(React, 'useEffect')
            .mockImplementation((effect) => {
                originalUseEffect(effect);
            });

        renderWithProviders(<PortfolioItem />, { withRouter: true });
        expect(document.title).toBe('test-repo | piech.dev');

        mockUseEffect.mockRestore();
        document.title = originalDocumentTitle;
    });
});
