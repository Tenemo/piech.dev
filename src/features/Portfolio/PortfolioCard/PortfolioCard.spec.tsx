import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import PortfolioCard from './PortfolioCard';
import styles from './portfolioCard.module.scss';

import { renderWithProviders } from 'utils/testUtils';

const mockedFetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () =>
            Promise.resolve({
                name: 'test-package',
                description: 'Test description',
            }),
    }),
);

vi.stubGlobal('fetch', mockedFetch);

describe('PortfolioCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedFetch.mockClear();
        console.error = vi.fn();
    });

    it('should render with correct structure and classes', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    name: 'test-project',
                    description: 'Test description',
                }),
        });

        const { container } = renderWithProviders(
            <PortfolioCard
                project="test-project"
                projectPreview="test.png"
                technologies={['typescript', 'react']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

        const cardElement = container.querySelector(`.${styles.card}`);
        expect(cardElement).toBeInTheDocument();
        expect(cardElement).toHaveClass(styles.imageLeft);

        const imageContainer = container.querySelector(
            `.${styles.imageContainer}`,
        );
        expect(imageContainer).toBeInTheDocument();

        const contentContainer = container.querySelector(`.${styles.content}`);
        expect(contentContainer).toBeInTheDocument();
    });

    it('should show loading state when fetching package info', () => {
        mockedFetch.mockImplementationOnce(
            () =>
                new Promise(() => {
                    return;
                }),
        );

        renderWithProviders(
            <PortfolioCard
                project="loading-test"
                projectPreview="test.png"
                technologies={['typescript']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        expect(
            screen.getByText(/loading project information/i),
        ).toBeInTheDocument();
    });

    it('should render image for non-video preview files', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    name: 'img-test',
                    description: 'Image test',
                }),
        });

        const { container } = renderWithProviders(
            <PortfolioCard
                project="img-test"
                projectPreview="test.png"
                technologies={['typescript']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

        const imgElement = container.querySelector(
            `img[src="/images/projects/test.png"]`,
        );
        expect(imgElement).toBeInTheDocument();
        expect(
            screen.queryByText(/your browser does not support the video tag/i),
        ).not.toBeInTheDocument();
    });

    it('should render video for video preview files', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    name: 'video-test',
                    description: 'Video test',
                }),
        });

        const { container } = renderWithProviders(
            <PortfolioCard
                project="video-test"
                projectPreview="test.mp4"
                technologies={['typescript']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

        const videoElement = container.querySelector('video');
        expect(videoElement).toBeInTheDocument();

        const sourceElement = videoElement?.querySelector('source');
        expect(sourceElement).toBeInTheDocument();
        expect(sourceElement).toHaveAttribute(
            'src',
            '/images/projects/test.mp4',
        );
    });

    it('should use imageRight class when imageOnRight is true', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    name: 'right-test',
                    description: 'Right image test',
                }),
        });

        const { container } = renderWithProviders(
            <PortfolioCard
                imageOnRight={true}
                project="right-test"
                projectPreview="test.png"
                technologies={['typescript']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

        const cardElement = container.querySelector(`.${styles.card}`);
        expect(cardElement).toHaveClass(styles.imageRight);
        expect(cardElement).not.toHaveClass(styles.imageLeft);
    });

    it('should use a custom repo name when provided', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    name: 'custom-repo',
                    description: 'Custom repo test',
                }),
        });

        renderWithProviders(
            <PortfolioCard
                project="display-name"
                projectPreview="test.png"
                repoName="custom-repo"
                technologies={['typescript']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });
        // @ts-expect-error typings issue, it is actually a nested array
        expect(mockedFetch.mock.calls[0][0]).toContain('custom-repo');
    });

    it('should display error message when fetch fails', async () => {
        mockedFetch.mockRejectedValueOnce(new Error('Fetch error'));
        const originalConsoleError = console.error;

        renderWithProviders(
            <PortfolioCard
                project="error-test"
                projectPreview="test.png"
                technologies={['typescript']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        const errorElement = await screen.findByText(/fetch error/i);
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveClass(styles.errorMessage);

        expect(console.error).toHaveBeenCalledWith(
            'Error fetching package info:',
            expect.any(Error),
        );

        console.error = originalConsoleError;
    });

    it('should use cached package info when available', async () => {
        const { rerender } = renderWithProviders(
            <PortfolioCard
                project="cached-project"
                projectPreview="test.png"
                repoName="cached-repo"
                technologies={['typescript']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

        mockedFetch.mockClear();

        rerender(
            <PortfolioCard
                project="cached-project"
                projectPreview="test.png"
                repoName="cached-repo"
                technologies={['typescript']}
            />,
        );

        await waitFor(() => {
            expect(
                screen.queryByText(/loading project information/i),
            ).not.toBeInTheDocument();
        });

        expect(mockedFetch).not.toHaveBeenCalled();
    });

    it('should link to the correct portfolio item page', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    name: 'link-test',
                    description: 'Link test',
                }),
        });

        renderWithProviders(
            <PortfolioCard
                project="link-test"
                projectPreview="test.png"
                technologies={['typescript']}
            />,
            { withRouter: true, withPortfolio: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

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
