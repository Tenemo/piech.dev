import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import Contact from './Contact';

vi.mock('@dr.pogodin/react-helmet', () => ({
    Helmet: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

vi.mock('@mui/icons-material', () => ({
    AlternateEmail: () => <span data-testid="email-icon">EmailIcon</span>,
    Telegram: () => <span data-testid="telegram-icon">TelegramIcon</span>,
}));

vi.mock('./contact.module.scss', () => ({
    default: {
        main: 'mock-main',
        contactInfoContainer: 'mock-contact-info-container',
        contactItemsContainer: 'mock-contact-items-container',
        contactItem: 'mock-contact-item',
    },
}));

describe('Contact', () => {
    it('should render the heading and general structure', () => {
        render(<Contact />);

        expect(
            screen.getByRole('heading', { level: 2, name: /contact/i }),
        ).toBeInTheDocument();

        expect(document.querySelector('.divider')).toBeInTheDocument();

        expect(screen.getByText(/./i, { selector: 'p' })).toBeInTheDocument();
    });

    it('should render contact links with correct attributes', () => {
        render(<Contact />);

        const emailIcon = screen.getByTestId('email-icon');
        expect(emailIcon).toBeInTheDocument();

        const emailLink = screen.getByRole('link', {
            name: /piotr@piech.dev/i,
        });
        expect(emailLink).toHaveAttribute('href', 'mailto:piotr@piech.dev');

        const telegramIcon = screen.getByTestId('telegram-icon');
        expect(telegramIcon).toBeInTheDocument();

        const telegramLink = screen.getByRole('link', { name: /@tenemo/i });
        expect(telegramLink).toHaveAttribute('href', 'https://t.me/tenemo');
        expect(telegramLink).toHaveAttribute('target', '_blank');
        expect(telegramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
