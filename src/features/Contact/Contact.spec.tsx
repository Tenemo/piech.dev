import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import Contact from './Contact';

import { renderWithProviders } from 'utils/testUtils';

describe('Contact', () => {
    it('should render the heading and general structure', () => {
        renderWithProviders(<Contact />);

        expect(
            screen.getByRole('heading', { level: 2, name: /contact/i }),
        ).toBeInTheDocument();

        expect(document.querySelector('.divider')).toBeInTheDocument();

        expect(screen.getAllByText(/./i, { selector: 'p' })).toHaveLength(2);
    });

    it('should render contact links with correct attributes', () => {
        renderWithProviders(<Contact />);

        const emailLink = screen.getByRole('link', {
            name: /piotr@piech.dev/i,
        });
        expect(emailLink).toHaveAttribute('href', 'mailto:piotr@piech.dev');

        const linkedinLink = screen.getByRole('link', { name: /\/ppiech/i });
        expect(linkedinLink).toHaveAttribute(
            'href',
            'https://www.linkedin.com/in/ppiech',
        );
        expect(linkedinLink).toHaveAttribute('target', '_blank');
        expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');

        const githubLink = screen.getByRole('link', { name: /\/Tenemo/i });
        expect(githubLink).toHaveAttribute('href', 'https://github.com/Tenemo');
        expect(githubLink).toHaveAttribute('target', '_blank');
        expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

        const telegramLink = screen.getByRole('link', { name: /@tenemo/i });
        expect(telegramLink).toHaveAttribute('href', 'https://t.me/tenemo');
        expect(telegramLink).toHaveAttribute('target', '_blank');
        expect(telegramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
