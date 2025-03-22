import React from 'react';
import { Link } from 'react-router';

import styles from './about.module.scss';

const About = (): React.JSX.Element => {
    return (
        <main>
            <h2>About me</h2>
            <div className={styles.divider} />
            <p>[TODO: short paragraph about me]</p>

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
