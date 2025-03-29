import GitHubIcon from '@mui/icons-material/GitHub';
import React from 'react';

import styles from './footer.module.scss';

const Footer = (): React.JSX.Element => {
    return (
        <footer className={styles.footer}>
            <a
                aria-label="GitHub repository"
                className={styles.gitHubLink}
                href="https://github.com/Tenemo/piech.dev"
                rel="noopener noreferrer"
                target="_blank"
            >
                <GitHubIcon />
            </a>
        </footer>
    );
};

export default Footer;
