import React from 'react';
import { Link, useLocation } from 'react-router';

import styles from './header.module.scss';

import {
    CONTACT_PATH,
    HOME_PATH,
    normalizePathForMatch,
    PROJECTS_PATH,
} from 'app/routePaths';

const Header = (): React.JSX.Element => {
    const location = useLocation();
    const normalizedPathname = normalizePathForMatch(location.pathname);
    const normalizedProjectsPath = normalizePathForMatch(PROJECTS_PATH);
    const normalizedContactPath = normalizePathForMatch(CONTACT_PATH);

    const getNavLinkClassName = (isActive: boolean): string =>
        isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink;

    const isAboutActive = normalizedPathname === HOME_PATH;
    const isProjectsActive =
        normalizedPathname === normalizedProjectsPath ||
        normalizedPathname.startsWith(`${normalizedProjectsPath}/`);
    const isContactActive = normalizedPathname === normalizedContactPath;

    return (
        <header className={styles.header}>
            <Link className={styles.logo} to={HOME_PATH}>
                <h1>piech.dev</h1>
            </Link>

            <nav aria-label="Primary" className={styles.navigation}>
                <Link
                    aria-current={isAboutActive ? 'page' : undefined}
                    className={getNavLinkClassName(isAboutActive)}
                    to={HOME_PATH}
                >
                    About me
                </Link>
                <Link
                    aria-current={isProjectsActive ? 'page' : undefined}
                    className={getNavLinkClassName(isProjectsActive)}
                    to={PROJECTS_PATH}
                >
                    Projects
                </Link>
                <Link
                    aria-current={isContactActive ? 'page' : undefined}
                    className={getNavLinkClassName(isContactActive)}
                    to={CONTACT_PATH}
                >
                    Contact
                </Link>
            </nav>
        </header>
    );
};

export default Header;
