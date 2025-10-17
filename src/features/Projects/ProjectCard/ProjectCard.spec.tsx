import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ProjectCard from './ProjectCard';
import styles from './projectCard.module.scss';

import { renderWithProviders } from 'utils/testUtils';
// Provide a default export to align with JSON default import usage in code
vi.mock('../../../../temp/githubData', () => ({
    default: {
        REPOSITORY_INFO: {
            'test-project': {
                name: 'test-project',
                description: 'Test description',
            },
            'img-test': {
                name: 'img-test',
                description: 'Image test',
                createdDatetime: '2023-09-12T08:00:00.000Z',
            },
            'video-test': {
                name: 'video-test',
                description: 'Video test',
                createdDatetime: '2022-01-20T15:30:00.000Z',
            },
            'right-test': {
                name: 'right-test',
                description: 'Right image test',
                createdDatetime: '2024-06-01T00:00:00.000Z',
            },
            'custom-repo': {
                name: 'custom-repo',
                description: 'Custom repo test',
                createdDatetime: '2020-12-31T23:59:59.000Z',
            },
            'cached-repo': {
                name: 'cached-repo',
                description: 'Cached repo',
                createdDatetime: '2019-03-10T10:00:00.000Z',
            },
            'link-test': {
                name: 'link-test',
                description: 'Link test',
                createdDatetime: '2018-07-07T07:07:07.000Z',
            },
            'epoch-test': {
                name: 'epoch-test',
                description: 'Epoch fallback',
                createdDatetime: '1970-01-01T00:00:00.000Z',
            },
        },
    },
}));

describe('ProjectCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        console.error = vi.fn();
    });

    it('should render with correct structure and classes', () => {
        const { container } = renderWithProviders(
            <ProjectCard
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
            <ProjectCard
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
            <ProjectCard
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

        // Date badge is rendered inside description, not in preview
        const previewHasBadge = container.querySelector(
            `.${styles.previewContainer} time.${styles.dateBadge}`,
        );
        expect(previewHasBadge).toBeNull();

        const descriptionLink = container.querySelector(
            `a.${styles.description}`,
        );
        const badge = descriptionLink?.querySelector(
            `time.${styles.dateBadge}`,
        ) as HTMLElement | null;
        expect(badge).toBeInTheDocument();
        // September 2023 (from 2023-09-12)
        expect(badge).toHaveTextContent(/september\s+2023/i);
        expect(badge).toHaveAttribute('dateTime', '2023-09-12T08:00:00.000Z');
        expect(badge).toHaveAttribute(
            'title',
            'Date the project was kicked off',
        );
        expect(badge).toHaveAccessibleName(
            /project kickoff month: september 2023/i,
        );
    });

    it('should render video for video preview files', () => {
        const { container } = renderWithProviders(
            <ProjectCard
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

        // Badge should reflect January 2022 for 2022-01-20
        const descriptionLink = container.querySelector(
            `a.${styles.description}`,
        );
        const badge = descriptionLink?.querySelector(
            `time.${styles.dateBadge}`,
        );
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent(/january\s+2022/i);
    });

    it('should use imageRight class when imageOnRight is true', () => {
        const { container } = renderWithProviders(
            <ProjectCard
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

        // Badge present for right-test
        const badge = container.querySelector(
            `a.${styles.description} time.${styles.dateBadge}`,
        );
        expect(badge).toBeInTheDocument();
    });

    it('should use a custom repo name when provided', () => {
        renderWithProviders(
            <ProjectCard
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
            .filter((l) => l.getAttribute('href')?.includes('/projects/'));
        expect(
            links.some(
                (l) => l.getAttribute('href') === '/projects/custom-repo',
            ),
        ).toBe(true);
    });

    it('should display error message when fetch fails', () => {
        renderWithProviders(
            <ProjectCard
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
        // No badge if no repo info
        expect(
            document.querySelector(`time.${styles.dateBadge}`),
        ).not.toBeInTheDocument();
    });

    it('should use cached package info when available', () => {
        const { rerender } = renderWithProviders(
            <ProjectCard
                project="cached-project"
                projectPreview="test.webp"
                repoName="cached-repo"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        rerender(
            <ProjectCard
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

    it('should link to the correct project item page', () => {
        renderWithProviders(
            <ProjectCard
                project="link-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const projectLinks = screen
            .getAllByRole('link')
            .filter((link) =>
                link.getAttribute('href')?.startsWith('/projects'),
            );

        expect(projectLinks.length).toBeGreaterThan(0);

        projectLinks.forEach((link) => {
            expect(link).toHaveAttribute('href', '/projects/link-test');
        });

        // Badge present and formatted for link-test
        const badge = document.querySelector(
            `a.${styles.description} time.${styles.dateBadge}`,
        );
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent(/july\s+2018/i);
    });

    it('should not render badge when repo info is missing', () => {
        renderWithProviders(
            <ProjectCard
                project="missing-repo"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );
        expect(
            document.querySelector(`time.${styles.dateBadge}`),
        ).not.toBeInTheDocument();
    });

    it('should render epoch fallback visually as January 1970', () => {
        const { container } = renderWithProviders(
            <ProjectCard
                project="epoch-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );
        const badge = container.querySelector(
            `a.${styles.description} time.${styles.dateBadge}`,
        );
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent(/january\s+1970/i);
        expect(badge).toHaveAccessibleName(
            /project kickoff month: january 1970/i,
        );
        expect(badge).toHaveAttribute(
            'title',
            'Date the project was kicked off',
        );
    });
});
