import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ProjectCard from './ProjectCard';
import styles from './projectCard.module.scss';

import { SILENT_CAPTIONS_TRACK_PATH } from 'app/appConstants';
import { renderApp } from 'utils/testing/renderApp';

const IMAGE_PREVIEW = {
    fileName: 'test.webp',
    width: 1200,
    height: 800,
};
const VIDEO_PREVIEW = {
    fileName: 'test.mp4',
    width: 1280,
    height: 720,
};

describe('ProjectCard', () => {
    it('renders the expected card structure', () => {
        const { container } = renderApp(
            <ProjectCard
                name="test-project"
                projectPreview={IMAGE_PREVIEW}
                repo="test-project"
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

    it('renders a lazy-loaded image preview for non-LCP image files', () => {
        renderApp(
            <ProjectCard
                name="img-test"
                projectPreview={IMAGE_PREVIEW}
                repo="img-test"
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
        expect(image).toHaveAttribute('loading', 'lazy');
        expect(image).toHaveAttribute('decoding', 'async');
        expect(image).toHaveAttribute('width', '1200');
        expect(image).toHaveAttribute('height', '800');
        expect(image).not.toHaveAttribute('fetchpriority');
    });

    it('prioritizes the LCP image when requested', () => {
        renderApp(
            <ProjectCard
                name="priority-test"
                prioritizePreview={true}
                projectPreview={IMAGE_PREVIEW}
                repo="img-test"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const image = screen.getByAltText('priority-test preview');

        expect(image).toHaveAttribute('fetchpriority', 'high');
        expect(image).not.toHaveAttribute('loading');
        expect(image).not.toHaveAttribute('decoding');
    });

    it('renders a video preview for video files', () => {
        renderApp(
            <ProjectCard
                name="video-test"
                projectPreview={VIDEO_PREVIEW}
                repo="video-test"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        const previewLink = screen.getByRole('link', {
            name: /view video-test project details/i,
        });
        const video = document.querySelector('video');
        const source = document.querySelector('video source');
        const track = document.querySelector('video track[kind="captions"]');

        expect(previewLink).toHaveAttribute('href', '/projects/video-test/');
        expect(source).toHaveAttribute('src', '/media/projects/test.mp4');
        expect(video).toHaveAttribute('preload', 'metadata');
        expect(video).toHaveAttribute('width', '1280');
        expect(video).toHaveAttribute('height', '720');
        expect(track).toHaveAttribute('src', SILENT_CAPTIONS_TRACK_PATH);
    });

    it('renders the project kickoff badge when repository data exists', () => {
        const { container } = renderApp(
            <ProjectCard
                name="img-test"
                projectPreview={IMAGE_PREVIEW}
                repo="img-test"
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

    it('uses the repository slug for route generation and the display name for visible text', () => {
        renderApp(
            <ProjectCard
                name="display-name"
                projectPreview={IMAGE_PREVIEW}
                repo="custom-repo"
                technologies={['typescript']}
            />,
            { withRouter: true },
        );

        expect(
            screen.getByRole('heading', { level: 3, name: /display-name/i }),
        ).toBeInTheDocument();

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
        renderApp(
            <ProjectCard
                name="missing-repo"
                projectPreview={IMAGE_PREVIEW}
                repo="missing-repo"
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
