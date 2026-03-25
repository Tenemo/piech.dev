import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ProjectCard from './ProjectCard';
import styles from './projectCard.module.scss';

import { renderWithProviders } from 'utils/testUtils';

describe('ProjectCard', () => {
    it('renders the expected card structure', () => {
        const { container } = renderWithProviders(
            <ProjectCard
                project="test-project"
                projectPreview="test.webp"
                technologies={['typescript', 'react']}
            />,
            { withRouter: true },
        );

        expect(container.querySelector(`.${styles.card}`)).toHaveClass(
            styles.imageLeft,
        );
        expect(
            container.querySelector(`.${styles.previewContainer}`),
        ).toBeInTheDocument();
        expect(
            container.querySelector(`.${styles.content}`),
        ).toBeInTheDocument();
    });

    it('renders an image preview for image files', () => {
        renderWithProviders(
            <ProjectCard
                project="img-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const previewLink = screen.getByRole('link', {
            name: /view img-test project details/i,
        });
        const image = screen.getByAltText('img-test preview');

        expect(previewLink).toHaveAttribute('href', '/projects/img-test/');
        expect(image).toHaveAttribute('src', '/media/projects/test.webp');
        expect(image).not.toHaveAttribute('fetchpriority');
    });

    it('renders a video preview for video files', () => {
        renderWithProviders(
            <ProjectCard
                project="video-test"
                projectPreview="test.mp4"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const previewLink = screen.getByRole('link', {
            name: /view video-test project details/i,
        });
        const source = document.querySelector('video source');

        expect(previewLink).toHaveAttribute('href', '/projects/video-test/');
        expect(source).toHaveAttribute('src', '/media/projects/test.mp4');
    });

    it('renders the project kickoff badge when repository data exists', () => {
        const { container } = renderWithProviders(
            <ProjectCard
                project="img-test"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const badge = container.querySelector(
            `a.${styles.description} time.${styles.dateBadge}`,
        );

        expect(badge).toHaveTextContent(/september\s+2023/i);
        expect(badge).toHaveAttribute('dateTime', '2023-09-12T08:00:00.000Z');
    });

    it('uses the custom repository name when provided', () => {
        renderWithProviders(
            <ProjectCard
                project="display-name"
                projectPreview="test.webp"
                repoName="custom-repo"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const projectLinks = screen
            .getAllByRole('link')
            .filter((link: HTMLElement) =>
                link.getAttribute('href')?.startsWith('/projects/'),
            );

        expect(
            projectLinks.every(
                (link: HTMLElement) =>
                    link.getAttribute('href') === '/projects/custom-repo/',
            ),
        ).toBe(true);
    });

    it('falls back to the static description when repository data is missing', () => {
        renderWithProviders(
            <ProjectCard
                project="missing-repo"
                projectPreview="test.webp"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        expect(
            screen.getByText(/no description available/i),
        ).toBeInTheDocument();
        expect(
            document.querySelector(`time.${styles.dateBadge}`),
        ).not.toBeInTheDocument();
    });
});
