import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ProjectMarkdown from './ProjectMarkdown';
import styles from './projectMarkdown.module.scss';

import { SILENT_CAPTIONS_TRACK_PATH } from 'app/appConstants';
import { GITHUB_OWNER } from 'app/siteLinks';

describe('ProjectMarkdown', () => {
    it('renders basic markdown content', () => {
        render(
            <ProjectMarkdown
                markdown={'# Test Heading\n\nThis is a paragraph.'}
                repo="test-repo"
            />,
        );

        expect(
            screen.getByRole('heading', { level: 1, name: 'Test Heading' }),
        ).toBeInTheDocument();
        expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
    });

    it('uses the configured project name as the page heading and strips a redundant README title', () => {
        render(
            <ProjectMarkdown
                markdown={'# sealed-vote\n\nOverview paragraph.'}
                repo="sealed-vote"
            />,
        );

        expect(
            screen.getByRole('heading', { level: 1, name: 'sealed.vote' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                level: 1,
                name: 'sealed-vote',
            }),
        ).not.toBeInTheDocument();
        expect(screen.getByText('Overview paragraph.')).toBeInTheDocument();
    });

    it('renders fenced code blocks without nested pre tags', () => {
        const { container } = render(
            <ProjectMarkdown
                markdown={'```typescript\nconst test: string = "Hello";\n```'}
                repo="test-repo"
            />,
        );

        const preElements = container.querySelectorAll('pre');
        expect(preElements).toHaveLength(1);
        expect(preElements[0]).toHaveClass(styles.codeBlock);
        expect(preElements[0]).toHaveAttribute('tabIndex', '0');
        expect(preElements[0]).toHaveAttribute(
            'aria-label',
            'typescript code example',
        );
        expect(preElements[0].querySelector('pre')).toBeNull();
        expect(preElements[0]).toHaveTextContent(
            'const test: string = "Hello";',
        );
    });

    it('renders inline code with the inline code class', () => {
        render(
            <ProjectMarkdown
                markdown="This is `inline code` in a paragraph."
                repo="test-repo"
            />,
        );

        expect(screen.getByText('inline code')).toHaveClass(styles.inlineCode);
    });

    it('rewrites relative image and link URLs using the repository default branch', () => {
        render(
            <ProjectMarkdown
                markdown={
                    '![Test Image](./media/test.webp)\n[Test Link](./src/index.ts)'
                }
                repo="test-repo"
            />,
        );

        expect(screen.getByAltText('Test Image')).toHaveAttribute(
            'src',
            `https://github.com/${GITHUB_OWNER}/test-repo/blob/main/media/test.webp?raw=true`,
        );
        expect(screen.getByText('Test Link')).toHaveAttribute(
            'href',
            `https://github.com/${GITHUB_OWNER}/test-repo/blob/main/src/index.ts`,
        );
    });

    it('does not rewrite absolute or anchor URLs', () => {
        render(
            <ProjectMarkdown
                markdown={
                    '[External Link](https://example.com)\n[Jump to Section](#section)'
                }
                repo="test-repo"
            />,
        );

        expect(screen.getByText('External Link')).toHaveAttribute(
            'href',
            'https://example.com',
        );
        expect(screen.getByText('Jump to Section')).toHaveAttribute(
            'href',
            '#section',
        );
    });

    it('renders GitHub user attachment links as videos', () => {
        const attachmentUrl =
            'https://github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc';

        render(
            <ProjectMarkdown
                markdown={`[Video](${attachmentUrl})`}
                repo="test-repo"
            />,
        );

        const video = screen.getByTitle('Video');
        const track = document.querySelector('video track[kind="captions"]');
        expect(video.tagName).toBe('VIDEO');
        expect(video).toHaveAttribute('src', attachmentUrl);
        expect(video).toHaveAttribute('preload', 'metadata');
        expect(video).toHaveClass(styles.videoPlayer);
        expect(track).toHaveAttribute('src', SILENT_CAPTIONS_TRACK_PATH);
    });

    it('renders GitHub user attachment images as images', () => {
        const attachmentUrl =
            'https://github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc';

        render(
            <ProjectMarkdown
                markdown={`![Image](${attachmentUrl})`}
                repo="test-repo"
            />,
        );

        expect(screen.getByAltText('Image')).toHaveAttribute(
            'src',
            attachmentUrl,
        );
        expect(screen.getByAltText('Image')).toHaveAttribute(
            'decoding',
            'async',
        );
        expect(screen.getByAltText('Image')).toHaveClass(styles.markdownImage);
    });

    it('renders README badge images inline instead of as block screenshots', () => {
        render(
            <ProjectMarkdown
                markdown={
                    '[![CI](https://img.shields.io/github/actions/workflow/status/Tenemo/piech.dev/ci.yml?branch=master&label=ci)](https://github.com/Tenemo/piech.dev/actions/workflows/ci.yml)\n[![Netlify status](https://api.netlify.com/api/v1/badges/example/deploy-status)](https://app.netlify.com/sites/example/deploys)'
                }
                repo="test-repo"
            />,
        );

        expect(screen.getByAltText('CI')).toHaveClass(styles.badgeImage);
        expect(screen.getByAltText('CI')).not.toHaveClass(styles.markdownImage);
        expect(screen.getByAltText('Netlify status')).toHaveClass(
            styles.badgeImage,
        );
    });

    it('adds an empty captions track to raw HTML videos without one', () => {
        render(
            <ProjectMarkdown
                markdown={
                    '<video controls src="https://example.com/demo.mp4"></video>'
                }
                repo="test-repo"
            />,
        );

        const video = document.querySelector('video');
        const track = document.querySelector('video track[kind="captions"]');

        expect(video).toHaveAttribute('preload', 'metadata');
        expect(video).toHaveClass(styles.videoPlayer);
        expect(track).toHaveAttribute('src', SILENT_CAPTIONS_TRACK_PATH);
    });

    it('sanitizes raw HTML while preserving safe markup', () => {
        const { container } = render(
            <ProjectMarkdown
                markdown={
                    '<script>alert("xss")</script><img alt="Safe image" src="./media/test.webp" onerror="alert(1)" width="500" />'
                }
                repo="test-repo"
            />,
        );

        expect(container.querySelector('script')).not.toBeInTheDocument();
        expect(screen.getByAltText('Safe image')).toHaveAttribute(
            'src',
            `https://github.com/${GITHUB_OWNER}/test-repo/blob/main/media/test.webp?raw=true`,
        );
        expect(screen.getByAltText('Safe image')).not.toHaveAttribute(
            'onerror',
        );
    });

    it('renders the created date badge when repository data exists', () => {
        render(<ProjectMarkdown markdown="Content" repo="img-test" />);

        expect(
            screen.getByLabelText(/Repository created:\s+September\s+2023/i),
        ).toHaveAttribute('dateTime', '2023-09-12T08:00:00.000Z');
    });

    it('does not render a date badge when repository data is missing', () => {
        render(<ProjectMarkdown markdown="Content" repo="missing-repo" />);

        expect(
            screen.queryByLabelText(/Repository created:/i),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('heading', { level: 1, name: 'missing-repo' }),
        ).toBeInTheDocument();
    });
});
