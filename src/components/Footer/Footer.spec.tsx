import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Footer from './Footer';
import styles from './footer.module.scss';

import { renderApp } from 'utils/testing/renderApp';

describe('Footer', () => {
    it('should render footer element', () => {
        const { container } = renderApp(<Footer />);
        const footerElement = container.querySelector('footer');

        expect(footerElement).toBeInTheDocument();
        expect(footerElement).toHaveClass(styles.footer);
    });

    it('should render GitHub link with correct attributes', () => {
        renderApp(<Footer />);

        const githubLink = screen.getByRole('link', {
            name: /github repository/i,
        });

        expect(githubLink).toHaveAttribute(
            'href',
            'https://github.com/Tenemo/piech.dev',
        );
        expect(githubLink).toHaveAttribute('target', '_blank');
        expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
        expect(githubLink).toHaveClass(styles.githubLink);
    });

    it('should render GitHub icon', () => {
        const { container } = renderApp(<Footer />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});
