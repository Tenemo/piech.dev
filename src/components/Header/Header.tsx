import { GitHub as GitHubIcon } from '@mui/icons-material';
import React from 'react';
import { Link, NavLink } from 'react-router';

import styles from './header.module.scss';

const Header = (): React.JSX.Element => {
    return (
        <header className={styles.header}>
            <Link className={styles.logo} to="/">
                <h1>piech.dev</h1>
            </Link>

            <nav className={styles.navigation}>
                <NavLink
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.activeLink}`
                            : styles.navLink
                    }
                    to="/portfolio"
                >
                    Portfolio
                </NavLink>
                <NavLink
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.activeLink}`
                            : styles.navLink
                    }
                    to="/about"
                >
                    About me
                </NavLink>
                <NavLink
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.activeLink}`
                            : styles.navLink
                    }
                    to="/contact"
                >
                    Contact
                </NavLink>
            </nav>

            <a
                className={styles.gitHubLink}
                href="https://github.com/Tenemo/piech.dev"
                rel="noopener noreferrer"
                target="_blank"
            >
                <GitHubIcon />
            </a>
        </header>
    );
};

export default Header;
