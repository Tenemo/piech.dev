import { GitHub as GitHubIcon } from '@mui/icons-material';
import React from 'react';

import styles from './footer.module.scss';

const Footer = (): React.JSX.Element => {
    return (
        <footer className={styles.footer}>
            <a
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
