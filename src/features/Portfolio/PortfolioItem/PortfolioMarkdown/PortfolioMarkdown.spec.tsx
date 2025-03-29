import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import PortfolioMarkdown from './PortfolioMarkdown';
import styles from './portfolioMarkdown.module.scss';

describe('PortfolioMarkdown', () => {
    it('should render basic markdown content', () => {
        const markdown = '# Test Heading\n\nThis is a paragraph.';

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Test Heading',
        );
        expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
    });

    it('should render code blocks with syntax highlighting', () => {
        const markdown = '```typescript\nconst test: string = "Hello";\n```';

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const codeElement = screen.getByRole('code');
        expect(codeElement).toBeInTheDocument();
        expect(codeElement).toHaveClass('language-typescript');

        const preElement = codeElement.closest('pre');
        expect(preElement).toHaveClass(styles.codeBlock);
    });

    it('should render inline code with special styling', () => {
        const markdown = 'This is `inline code` in a paragraph.';

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const inlineCode = screen.getByText('inline code');
        expect(inlineCode).toHaveClass(styles.inlineCode);
    });

    it('should transform relative image URLs to GitHub raw URLs', () => {
        const markdown = '![Test Image](./images/test.png)';

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const image = screen.getByAltText('Test Image');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute(
            'src',
            'https://github.com/tenemo/test-repo/blob/master/images/test.png?raw=true',
        );
    });

    it('should transform relative link URLs to GitHub URLs', () => {
        const markdown = '[Test Link](./src/index.ts)';

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const link = screen.getByText('Test Link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            'href',
            'https://github.com/tenemo/test-repo/blob/master/src/index.ts',
        );
    });

    it('should not transform absolute URLs', () => {
        const markdown = '[External Link](https://example.com)';

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const link = screen.getByText('External Link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should not transform anchor links', () => {
        const markdown = '[Jump to Section](#section)';

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const link = screen.getByText('Jump to Section');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '#section');
    });

    it('should render GitHub user attachment links as videos', () => {
        const attachmentUrl =
            'https://github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc';
        const markdown = `[Video](${attachmentUrl})`;

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const video = screen.getByTitle('Video');
        expect(video.tagName).toBe('VIDEO');
        expect(video).toHaveAttribute('src', attachmentUrl);
        expect(video).toHaveAttribute('autoplay', '');
        expect(video).toHaveAttribute('loop', '');
        expect(video).toHaveAttribute('controls', '');
        expect(video).toHaveClass(styles.videoPlayer);
    });

    it('should render GitHub user attachment images as videos', () => {
        const attachmentUrl =
            'https://github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc';
        const markdown = `![Video](${attachmentUrl})`;

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const video = screen.getByTitle('Video');
        expect(video.tagName).toBe('VIDEO');
        expect(video).toHaveAttribute('src', attachmentUrl);
        expect(video).toHaveClass(styles.videoPlayer);
    });

    it('should apply custom styling to headings', () => {
        const markdown = '# Heading 1\n## Heading 2\n### Heading 3';

        render(<PortfolioMarkdown markdown={markdown} repo="test-repo" />);

        const h1 = screen.getByRole('heading', { level: 1 });
        const h2 = screen.getByRole('heading', { level: 2 });
        const h3 = screen.getByRole('heading', { level: 3 });

        expect(h1).toHaveTextContent('Heading 1');
        expect(h2).toHaveTextContent('Heading 2');
        expect(h3).toHaveTextContent('Heading 3');

        expect(h1.style.color).toBe('var(--accent-color)');
        expect(h2.style.color).toBe('var(--accent-color)');
        expect(h3.style.color).toBe('var(--accent-color)');
    });
});
