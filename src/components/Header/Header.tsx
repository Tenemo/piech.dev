import React from 'react';
import { Link, NavLink } from 'react-router';

import styles from './header.module.scss';

import { CONTACT_PATH, HOME_PATH, PROJECTS_PATH } from 'app/routePaths';

const Header = (): React.JSX.Element => {
    return (
        <header className={styles.header}>
            <Link className={styles.logo} to={HOME_PATH}>
                <h1>piech.dev</h1>
            </Link>

            <nav aria-label="Primary" className={styles.navigation}>
                <NavLink
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.activeLink}`
                            : styles.navLink
                    }
                    to={HOME_PATH}
                >
                    About me
                </NavLink>
                <NavLink
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.activeLink}`
                            : styles.navLink
                    }
                    to={PROJECTS_PATH}
                >
                    Projects
                </NavLink>
                <NavLink
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.activeLink}`
                            : styles.navLink
                    }
                    to={CONTACT_PATH}
                >
                    Contact
                </NavLink>
            </nav>
        </header>
    );
};

export default Header;
