import React from 'react';

import styles from './header.module.scss';

const Header = (): React.JSX.Element => {
    return (
        <header className={styles.header}>
            <h1>piech.dev</h1>
        </header>
    );
};

export default Header;
