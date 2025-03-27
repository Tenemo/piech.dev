import React from 'react';
import { Link } from 'react-router';

import styles from './about.module.scss';

const About = (): React.JSX.Element => {
    return (
        <main className={styles.main}>
            <h2>About me</h2>
            <div className={'divider'} />
            <p>
                My name is Piotr and I&apos;m an IT specialist with over 12
                years of experience. I have over 5 years of management
                experience, leading teams and managing projects since 2020.
            </p>
            <p>Almost my entire career has been spent working remotely.</p>

            <div className={styles.buttonsContainer}>
                <Link className={styles.mainButton} to="/portfolio">
                    Check out my portfolio
                </Link>

                <div className={styles.dividerText}>OR</div>

                <Link className={styles.contactButton} to="/contact">
                    Contact me
                </Link>
            </div>
        </main>
    );
};

export default About;
