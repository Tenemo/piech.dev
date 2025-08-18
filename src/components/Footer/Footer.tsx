import GitHubIcon from '@mui/icons-material/GitHub';
import React from 'react';

// All footer styles are in styles/critical.css and inlined in <head>

const Footer = (): React.JSX.Element => {
    return (
        <footer data-critical-css="footer">
            <a
                aria-label="GitHub repository"
                data-critical-css="github-link"
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
