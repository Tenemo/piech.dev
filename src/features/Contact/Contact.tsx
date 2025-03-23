import {
    AlternateEmail as EmailIcon,
    Telegram as TelegramIcon,
} from '@mui/icons-material';
import React from 'react';

import styles from './contact.module.scss';

const Contact = (): React.JSX.Element => {
    return (
        <main>
            <h2>Contact</h2>
            <div className={styles.contactInfoContainer}>
                <div className={styles.contactItem}>
                    <a href="mailto:piotr@piech.dev">
                        <EmailIcon />
                        piotr@piech.dev
                    </a>
                </div>
                <div className={styles.contactItem}>
                    <a
                        href="https://t.me/tenemo"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <TelegramIcon />
                        @tenemo
                    </a>
                </div>
            </div>
        </main>
    );
};

export default Contact;
