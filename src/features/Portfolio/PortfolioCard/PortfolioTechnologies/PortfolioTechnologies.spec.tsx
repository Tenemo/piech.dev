import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import PortfolioTechnologies from './PortfolioTechnologies';

import { renderWithProviders } from 'utils/testUtils';

vi.mock('features/Portfolio/technologies', () => ({
    TECHNOLOGIES: {
        react: {
            fullName: 'React',
            url: 'https://reactjs.org/',
            wideLogo: true,
        },
        typescript: {
            fullName: 'TypeScript',
            url: 'https://www.typescriptlang.org/',
        },
    },
}));

describe('PortfolioTechnologies', () => {
    it('should render nothing when technologies array is empty', () => {
        const { container } = renderWithProviders(
            <PortfolioTechnologies technologies={[]} />,
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render all provided technologies', () => {
        renderWithProviders(
            <PortfolioTechnologies technologies={['react', 'typescript']} />,
        );

        expect(
            screen.getByRole('link', { name: /react/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /typescript/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('img', { name: 'react logo' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('img', { name: 'typescript logo' }),
        ).toBeInTheDocument();
    });

    it('should apply different classes based on wideLogo property', () => {
        const { container } = renderWithProviders(
            <PortfolioTechnologies technologies={['react', 'typescript']} />,
        );

        const reactLogo = container.querySelector('img[alt="react logo"]');
        const typescriptLogo = container.querySelector(
            'img[alt="typescript logo"]',
        );

        expect(reactLogo?.className).not.toBe(typescriptLogo?.className);
    });

    it('should have correct href and title attributes on links', () => {
        renderWithProviders(
            <PortfolioTechnologies technologies={['react', 'typescript']} />,
        );

        const reactLink = screen.getByRole('link', { name: /react/i });
        const typescriptLink = screen.getByRole('link', {
            name: /typescript/i,
        });

        expect(reactLink).toHaveAttribute('href', 'https://reactjs.org/');
        expect(reactLink).toHaveAttribute('title', 'React');
        expect(typescriptLink).toHaveAttribute(
            'href',
            'https://www.typescriptlang.org/',
        );
        expect(typescriptLink).toHaveAttribute('title', 'TypeScript');
    });

    it('should have correct attributes on images', () => {
        const { container } = renderWithProviders(
            <PortfolioTechnologies technologies={['react']} />,
        );

        const reactLogo = container.querySelector('img[alt="react logo"]');

        expect(reactLogo).toHaveAttribute('src', 'images/logos/react_logo.png');
        expect(reactLogo).toHaveAttribute('alt', 'react logo');
    });
});
