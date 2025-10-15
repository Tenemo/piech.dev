import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import Header from './Header';

import { renderWithProviders } from 'utils/testUtils';

describe('Header', () => {
    it('should render header with piech.dev title', () => {
        renderWithProviders(<Header />);

        const headingElement = screen.getByRole('heading', {
            level: 1,
            name: /piech\.dev/i,
        });

        expect(headingElement).toBeInTheDocument();
    });

    it('should render navigation links', () => {
        renderWithProviders(<Header />);

        const projectsLink = screen.getByText(/projects/i);
        const aboutLink = screen.getByText(/about me/i);
        const contactLink = screen.getByText(/contact/i);

        expect(projectsLink).toBeInTheDocument();
        expect(aboutLink).toBeInTheDocument();
        expect(contactLink).toBeInTheDocument();
    });
});
