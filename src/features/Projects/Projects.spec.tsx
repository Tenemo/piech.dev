import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { meta as projectsMeta } from '../../routes/projects';

import ProjectPage from './Projects';
import styles from './projects.module.scss';

import { PROJECTS_PATH } from 'app/routePaths';
import { renderApp } from 'utils/testing/renderApp';

describe('Projects page', () => {
    it('should render projects heading and divider', () => {
        renderApp(<ProjectPage />);

        expect(
            screen.getByRole('heading', { name: /projects/i }),
        ).toBeInTheDocument();
        expect(document.querySelector('.divider')).toBeInTheDocument();
    });

    it('should render the main projects container with correct class', () => {
        const { container } = renderApp(<ProjectPage />);

        const mainElement = container.querySelector('main');
        expect(mainElement).toBeInTheDocument();
        expect(mainElement).toHaveClass(styles.projects);

        const projectsItemsContainer = container.querySelector(
            `.${styles.projectsItemsContainer}`,
        );
        expect(projectsItemsContainer).toBeInTheDocument();
    });

    it('should render all project items', () => {
        renderApp(<ProjectPage />);

        const getHeading = (name: RegExp): HTMLElement =>
            screen.getByRole('heading', { level: 3, name });

        expect(getHeading(/reactplate/i)).toBeInTheDocument();
        expect(getHeading(/threshold-elgamal/i)).toBeInTheDocument();
        expect(getHeading(/sealed\.vote/i)).toBeInTheDocument();
        expect(getHeading(/expressplate/i)).toBeInTheDocument();
        expect(getHeading(/aliases\.sh/i)).toBeInTheDocument();
    });

    it('should include a divider between project items', () => {
        const { container } = renderApp(<ProjectPage />);

        const dividers = container.querySelectorAll('.divider');

        expect(dividers.length).toBeGreaterThan(1);
    });

    it('exposes correct meta for Projects route', () => {
        const metaArgs = {
            params: {},
            data: null,
            location: {
                pathname: PROJECTS_PATH,
                search: '',
                hash: '',
                state: null,
                key: 'test',
                unstable_mask: undefined,
            },
            loaderData: {} as Record<string, never>,
            matches: [],
        } satisfies Parameters<typeof projectsMeta>[0];

        const tags = projectsMeta(metaArgs);

        expect(tags).toEqual(
            expect.arrayContaining([
                { title: 'Projects | piech.dev' },
                expect.objectContaining({
                    tagName: 'link',
                    rel: 'canonical',
                    href: 'https://piech.dev/projects/',
                }),
                expect.objectContaining({ name: 'description' }),
            ]),
        );
    });
});
