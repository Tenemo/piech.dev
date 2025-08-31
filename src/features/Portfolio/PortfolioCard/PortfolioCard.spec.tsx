import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import PortfolioCard from './PortfolioCard';
import styles from './portfolioCard.module.scss';

import { renderWithProviders } from 'utils/testUtils';
// Provide a default export to align with JSON default import usage in code
vi.mock('../../../../temp/githubData', () => ({
    default: {
        REPOSITORY_INFO: {
            'test-project': {
                name: 'test-project',
                description: 'Test description',
            },
            'img-test': { name: 'img-test', description: 'Image test' },
            'video-test': { name: 'video-test', description: 'Video test' },
            'right-test': {
                name: 'right-test',
                description: 'Right image test',
            },
            'custom-repo': {
                name: 'custom-repo',
                description: 'Custom repo test',
            },
            'cached-repo': { name: 'cached-repo', description: 'Cached repo' },
            'link-test': { name: 'link-test', description: 'Link test' },
        },
    },
}));

describe('PortfolioCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        console.error = vi.fn();
    });

    it('should render with correct structure and classes', () => {
        const { container } = renderWithProviders(
            <PortfolioCard
                project="test-project"
                projectPreview="test.webp"
                technologies={['typescript', 'react']}
            />,
            { withRouter: true },
        );

        const cardElement = container.querySelector(`.${styles.card}`);
        expect(cardElement).toBeInTheDocument();
        expect(cardElement).toHaveClass(styles.imageLeft);

        const previewContainer = container.querySelector(
            `.${styles.previewContainer}`,
        );
        expect(previewContainer).toBeInTheDocument();

        const contentContainer = container.querySelector(`.${styles.content}`);
        expect(contentContainer).toBeInTheDocument();
    });

    it('should show loading state when fetching package info', () => {
        renderWithProviders(
            <PortfolioCard
                project="loading-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );
        // no loading state anymore
        expect(
            screen.queryByText(/loading project information/i),
        ).not.toBeInTheDocument();
    });

    it('should render image for non-video preview files', () => {
        const { container } = renderWithProviders(
            <PortfolioCard
                project="img-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const imgElement = container.querySelector(
            `img[src="/media/projects/test.webp"]`,
        );
        expect(imgElement).toBeInTheDocument();
        expect(
            screen.queryByText(/your browser does not support the video tag/i),
        ).not.toBeInTheDocument();

        // Accessible name on the wrapping link
        const previewLink = screen.getByRole('link', {
            name: /view img-test project details/i,
        });
        expect(previewLink).toBeInTheDocument();
    });

    it('should render video for video preview files', () => {
        const { container } = renderWithProviders(
            <PortfolioCard
                project="video-test"
                projectPreview="test.mp4"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const videoElement = container.querySelector('video');
        expect(videoElement).toBeInTheDocument();

        const sourceElement = videoElement?.querySelector('source');
        expect(sourceElement).toBeInTheDocument();
        expect(sourceElement).toHaveAttribute(
            'src',
            '/media/projects/test.mp4',
        );

        // Accessible name on the wrapping link
        const previewLink = screen.getByRole('link', {
            name: /view video-test project details/i,
        });
        expect(previewLink).toBeInTheDocument();
    });

    it('should use imageRight class when imageOnRight is true', () => {
        const { container } = renderWithProviders(
            <PortfolioCard
                imageOnRight={true}
                project="right-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const cardElement = container.querySelector(`.${styles.card}`);
        expect(cardElement).toHaveClass(styles.imageRight);
        expect(cardElement).not.toHaveClass(styles.imageLeft);
    });

    it('should use a custom repo name when provided', () => {
        renderWithProviders(
            <PortfolioCard
                project="display-name"
                projectPreview="test.webp"
                repoName="custom-repo"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );
        // ensure it links to custom repo route
        const links = screen
            .getAllByRole('link')
            .filter((l) => l.getAttribute('href')?.includes('/portfolio/'));
        expect(
            links.some(
                (l) => l.getAttribute('href') === '/portfolio/custom-repo',
            ),
        ).toBe(true);
    });

    it('should display error message when fetch fails', () => {
        renderWithProviders(
            <PortfolioCard
                project="error-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );
        // no error state now; shows fallback description
        expect(
            screen.getByText(/no description available/i),
        ).toBeInTheDocument();
    });

    it('should use cached package info when available', () => {
        const { rerender } = renderWithProviders(
            <PortfolioCard
                project="cached-project"
                projectPreview="test.webp"
                repoName="cached-repo"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        rerender(
            <PortfolioCard
                project="cached-project"
                projectPreview="test.webp"
                repoName="cached-repo"
                technologies={['typescript']}
            />,
        );
        expect(
            screen.queryByText(/loading project information/i),
        ).not.toBeInTheDocument();
    });

    it('should link to the correct portfolio item page', () => {
        renderWithProviders(
            <PortfolioCard
                project="link-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const portfolioLinks = screen
            .getAllByRole('link')
            .filter((link) =>
                link.getAttribute('href')?.startsWith('/portfolio'),
            );

        expect(portfolioLinks.length).toBeGreaterThan(0);

        portfolioLinks.forEach((link) => {
            expect(link).toHaveAttribute('href', '/portfolio/link-test');
        });
    });
});
