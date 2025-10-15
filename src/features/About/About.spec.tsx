import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import About from './About';
import styles from './about.module.scss';

import { renderWithProviders } from 'utils/testUtils';

describe('About', () => {
    it('should render the heading and general structure', () => {
        renderWithProviders(<About />);

        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

        const paragraphs = screen.getAllByText(/./i, { selector: 'p' });
        expect(paragraphs.length).toBeGreaterThan(0);

        expect(document.querySelector('.divider')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
        renderWithProviders(<About />);

        const projectsLink = screen.getByRole('link', { name: /projects/i });
        expect(projectsLink).toBeInTheDocument();
        expect(projectsLink).toHaveAttribute('href', '/projects');
        expect(projectsLink).toHaveClass(styles.mainButton);

        const contactLink = screen.getByRole('link', { name: /contact/i });
        expect(contactLink).toBeInTheDocument();
        expect(contactLink).toHaveAttribute('href', '/contact');
        expect(contactLink).toHaveClass(styles.contactButton);

        const dividerText = screen.getByText('OR');
        expect(dividerText).toBeInTheDocument();
        expect(dividerText).toHaveClass(styles.dividerText);
    });
});
