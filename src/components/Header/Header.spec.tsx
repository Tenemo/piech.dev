import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';

import Header from './Header';
import styles from './header.module.scss';

import { renderApp } from 'utils/testing/renderApp';

describe('Header', () => {
    it('should render header with piech.dev title', () => {
        renderApp(<Header />);

        const headingElement = screen.getByRole('heading', {
            level: 1,
            name: /piech\.dev/i,
        });

        expect(headingElement).toBeInTheDocument();
    });

    it('should render navigation links', () => {
        renderApp(<Header />);

        const projectsLink = screen.getByText(/projects/i);
        const aboutLink = screen.getByText(/about me/i);
        const contactLink = screen.getByText(/contact/i);

        expect(projectsLink).toBeInTheDocument();
        expect(aboutLink).toBeInTheDocument();
        expect(contactLink).toBeInTheDocument();
    });

    it('marks the about link as active on the home route', () => {
        renderApp(
            <MemoryRouter initialEntries={['/']}>
                <Header />
            </MemoryRouter>,
            { withRouter: false },
        );

        expect(screen.getByRole('link', { name: 'About me' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(screen.getByRole('link', { name: 'About me' })).toHaveClass(
            styles.activeLink,
        );
        expect(
            screen.getByRole('link', { name: 'Projects' }),
        ).not.toHaveAttribute('aria-current');
        expect(
            screen.getByRole('link', { name: 'Contact' }),
        ).not.toHaveAttribute('aria-current');
    });

    it('marks the projects link as active on the projects listing route', () => {
        renderApp(
            <MemoryRouter initialEntries={['/projects/']}>
                <Header />
            </MemoryRouter>,
            { withRouter: false },
        );

        expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(screen.getByRole('link', { name: 'Projects' })).toHaveClass(
            styles.activeLink,
        );
    });

    it('marks the projects link as active on project detail routes', () => {
        renderApp(
            <MemoryRouter initialEntries={['/projects/threshold-elgamal/']}>
                <Header />
            </MemoryRouter>,
            { withRouter: false },
        );

        expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(screen.getByRole('link', { name: 'Projects' })).toHaveClass(
            styles.activeLink,
        );
    });

    it('marks the contact link as active on the contact route', () => {
        renderApp(
            <MemoryRouter initialEntries={['/contact/']}>
                <Header />
            </MemoryRouter>,
            { withRouter: false },
        );

        expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(screen.getByRole('link', { name: 'Contact' })).toHaveClass(
            styles.activeLink,
        );
        expect(
            screen.getByRole('link', { name: 'About me' }),
        ).not.toHaveAttribute('aria-current');
        expect(
            screen.getByRole('link', { name: 'Projects' }),
        ).not.toHaveAttribute('aria-current');
    });
});
