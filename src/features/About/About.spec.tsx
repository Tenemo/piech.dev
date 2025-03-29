import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import About from './About';

vi.mock('@dr.pogodin/react-helmet', () => ({
    Helmet: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

vi.mock('./about.module.scss', () => ({
    default: {
        main: 'mock-main',
        aboutMeDescription: 'mock-about-me-description',
        buttonsContainer: 'mock-buttons-container',
        dividerText: 'mock-divider-text',
        mainButton: 'mock-main-button',
        contactButton: 'mock-contact-button',
    },
}));

describe('About', () => {
    it('should render the heading and general structure', () => {
        render(
            <BrowserRouter>
                <About />
            </BrowserRouter>,
        );

        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

        const paragraphs = screen.getAllByText(/./i, { selector: 'p' });
        expect(paragraphs.length).toBeGreaterThan(0);

        expect(document.querySelector('.divider')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
        render(
            <BrowserRouter>
                <About />
            </BrowserRouter>,
        );

        const portfolioLink = screen.getByRole('link', { name: /portfolio/i });
        expect(portfolioLink).toBeInTheDocument();
        expect(portfolioLink).toHaveAttribute('href', '/portfolio');

        const contactLink = screen.getByRole('link', { name: /contact/i });
        expect(contactLink).toBeInTheDocument();
        expect(contactLink).toHaveAttribute('href', '/contact');

        const dividerText = screen.getByText('OR');
        expect(dividerText).toBeInTheDocument();
    });
});
