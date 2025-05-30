import { Helmet } from '@dr.pogodin/react-helmet';
import React from 'react';
import { Link } from 'react-router';

import styles from './about.module.scss';

const About = (): React.JSX.Element => {
    return (
        <main className={styles.main}>
            <Helmet>
                <title>About me | piech.dev</title>
            </Helmet>
            <h2>About me</h2>
            <div className={'divider'} />
            <p className={styles.smallHeadline}>
                ISO 8601 fan since 2012. Actually RFC 3339 but let&apos;s not
                get into it.
            </p>
            <div className={'divider'} />

            <div className={styles.aboutMeDescription}>
                <p>
                    Welcome to my personal website - my name is Piotr and
                    I&apos;m an IT specialist with over 12 years of experience.
                    I created this site so that I have an easy way of sharing
                    some of my non-commercial projects that I worked on.
                </p>
                <p>
                    When it comes to my track record, I have over 6 years of
                    management experience, leading teams and managing projects
                    since 2018. My entire career has been spent working
                    remotely.
                </p>
                <div className={styles.buttonsContainer}>
                    <Link className={styles.mainButton} to="/portfolio">
                        Check out my portfolio
                    </Link>

                    <div className={styles.dividerText}>OR</div>

                    <Link className={styles.contactButton} to="/contact">
                        Contact me
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default About;
