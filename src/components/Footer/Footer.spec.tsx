import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import Footer from './Footer';
import styles from './footer.module.scss';

import { renderWithProviders } from 'utils/testUtils';

describe('Footer', () => {
    it('should render footer element', () => {
        const { container } = renderWithProviders(<Footer />);
        const footerElement = container.querySelector('footer');

        expect(footerElement).toBeInTheDocument();
        expect(footerElement).toHaveClass(styles.footer);
    });

    it('should render GitHub link with correct attributes', () => {
        renderWithProviders(<Footer />);

        const githubLink = screen.getByRole('link', {
            name: /github repository/i,
        });

        expect(githubLink).toHaveAttribute(
            'href',
            'https://github.com/Tenemo/piech.dev',
        );
        expect(githubLink).toHaveAttribute('target', '_blank');
        expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
        expect(githubLink).toHaveClass(styles.gitHubLink);
    });

    it('should render GitHub icon', () => {
        renderWithProviders(<Footer />);

        const githubIcon = screen.getByLabelText('GitHub repository');
        expect(githubIcon).toBeInTheDocument();
    });
});
