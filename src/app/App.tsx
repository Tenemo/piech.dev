import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router';

import styles from './app.module.scss';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';

const App = (): React.JSX.Element => {
    return (
        <div className={styles.app}>
            <ErrorBoundary
                fallback={
                    <div>
                        The application has crashed due to a rendering error.
                    </div>
                }
                onError={(error) => {
                    console.error(error);
                }}
            >
                <Header />
                <Outlet />
                <Footer />
            </ErrorBoundary>
        </div>
    );
};

export default App;
