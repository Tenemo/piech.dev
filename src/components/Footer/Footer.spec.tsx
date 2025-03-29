import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import Footer from './Footer';

vi.mock('./footer.module.scss', () => ({
    default: {
        footer: 'mock-footer',
        gitHubLink: 'mock-github-link',
    },
}));

vi.mock('@mui/icons-material', () => ({
    GitHub: () => <span data-testid="github-icon">GithubIcon</span>,
}));

describe('Footer', () => {
    it('should render footer element', () => {
        const { container } = render(<Footer />);
        const footerElement = container.querySelector('footer');

        expect(footerElement).toBeInTheDocument();
        expect(footerElement).toHaveClass('mock-footer');
    });

    it('should render GitHub link with correct attributes', () => {
        render(<Footer />);

        const githubLink = screen.getByRole('link', {
            name: /github repository/i,
        });

        expect(githubLink).toHaveAttribute(
            'href',
            'https://github.com/Tenemo/piech.dev',
        );
        expect(githubLink).toHaveAttribute('target', '_blank');
        expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
        expect(githubLink).toHaveClass('mock-github-link');
    });

    it('should render GitHub icon', () => {
        render(<Footer />);

        const githubIcon = screen.getByTestId('github-icon');

        expect(githubIcon).toBeInTheDocument();
    });
});
