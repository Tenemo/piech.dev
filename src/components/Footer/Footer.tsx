import React from 'react';

import styles from './footer.module.scss';

import { SITE_LINKS } from 'app/siteLinks';
import { GitHubIcon } from 'components/Icons';

const Footer = (): React.JSX.Element => {
    return (
        <footer className={styles.footer}>
            <a
                aria-label="GitHub repository"
                className={styles.githubLink}
                href={SITE_LINKS.githubRepo}
                rel="noopener noreferrer"
                target="_blank"
            >
                <GitHubIcon />
            </a>
        </footer>
    );
};

export default Footer;
