import React from 'react';

import styles from './contact.module.scss';

import { MAIN_CONTENT_ID } from 'app/accessibility';
import { SITE_LINKS } from 'app/siteLinks';
import {
    EmailIcon,
    GitHubIcon,
    LinkedInIcon,
    TelegramIcon,
} from 'components/Icons';

type ContactItem = {
    icon: typeof EmailIcon;
    label: string;
    href: string;
    text: string;
    external?: boolean;
};

const CONTACT_ITEMS: readonly ContactItem[] = [
    {
        icon: EmailIcon,
        label: 'email',
        href: SITE_LINKS.email,
        text: SITE_LINKS.emailAddress,
        external: false,
    },
    {
        icon: LinkedInIcon,
        label: 'linkedin',
        href: SITE_LINKS.linkedin,
        text: '/ppiech',
        external: true,
    },
    {
        icon: GitHubIcon,
        label: 'github',
        href: SITE_LINKS.githubProfile,
        text: '/Tenemo',
        external: true,
    },
    {
        icon: TelegramIcon,
        label: 'telegram',
        href: SITE_LINKS.telegram,
        text: '@tenemo',
        external: true,
    },
] as const;

const Contact = (): React.JSX.Element => {
    return (
        <main className={styles.main} id={MAIN_CONTENT_ID} tabIndex={-1}>
            <h2>Contact</h2>
            <div className={'divider'} />
            <div className={styles.contactInfoContainer}>
                <p>
                    If you have a project idea, questions about a project of
                    mine, I look like a good candidate for an open position, or
                    you would like to get in touch for other reasons, please
                    feel free to reach out via any of the platforms listed
                    below. I provide my resume upon request.
                </p>
                <p>
                    I speak fluent English, Polish, and Russian: I&apos;m
                    comfortable with working in any one of these three
                    languages. I understand Ukrainian well, but I don&apos;t
                    speak it, unfortunately.
                </p>
                <div className={styles.contactItemsContainer}>
                    {CONTACT_ITEMS.map(
                        ({
                            icon: Icon,
                            label,
                            href,
                            text,
                            external = false,
                        }) => (
                            <div className={styles.contactItem} key={label}>
                                <Icon />
                                {label}:
                                <a
                                    href={href}
                                    rel={
                                        external
                                            ? 'noopener noreferrer'
                                            : undefined
                                    }
                                    target={external ? '_blank' : undefined}
                                >
                                    {text}
                                </a>
                            </div>
                        ),
                    )}
                </div>
            </div>
        </main>
    );
};

export default Contact;
