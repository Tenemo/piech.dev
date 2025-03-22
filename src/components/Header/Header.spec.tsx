import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect } from 'vitest';

import Header from './Header';

describe('Header', () => {
    it('should render header with piech.dev title', () => {
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>,
        );

        const headingElement = screen.getByRole('heading', {
            level: 1,
            name: /piech\.dev/i,
        });

        expect(headingElement).toBeInTheDocument();
    });

    it('should render navigation links', () => {
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>,
        );

        const portfolioLink = screen.getByText(/portfolio/i);
        const aboutLink = screen.getByText(/about me/i);
        const contactLink = screen.getByText(/contact/i);

        expect(portfolioLink).toBeInTheDocument();
        expect(aboutLink).toBeInTheDocument();
        expect(contactLink).toBeInTheDocument();
    });
});
