import { Helmet } from '@dr.pogodin/react-helmet';
import EmailIcon from '@mui/icons-material/AlternateEmail';
import GitHubIcon from '@mui/icons-material/GitHub';
import TelegramIcon from '@mui/icons-material/Telegram';
import React from 'react';

import styles from './contact.module.scss';

const Contact = (): React.JSX.Element => {
    return (
        <main className={styles.main}>
            <Helmet>
                <title>Contact | piech.dev</title>
            </Helmet>
            <h2>Contact</h2>
            <div className={'divider'} />
            <div className={styles.contactInfoContainer}>
                <p>
                    If you have a project idea, questions about a project of
                    mine, I look like a good candidate for an open position, or
                    you would like to get in touch for other reasons, please
                    feel free to reach out via email or Telegram. I provide my
                    resume upon request.
                </p>
                <div className={styles.contactItemsContainer}>
                    <div className={styles.contactItem}>
                        <EmailIcon />
                        email:
                        <a href="mailto:piotr@piech.dev">piotr@piech.dev</a>
                    </div>
                    <div className={styles.contactItem}>
                        <GitHubIcon />
                        github:
                        <a
                            href="https://github.com/Tenemo"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            /Tenemo
                        </a>
                    </div>
                    <div className={styles.contactItem}>
                        <TelegramIcon />
                        telegram:
                        <a
                            href="https://t.me/tenemo"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            @tenemo
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Contact;
