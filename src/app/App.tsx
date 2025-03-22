import 'normalize.css';

import 'fonts/RobotoMono-Regular.woff2';
import 'fonts/RobotoMono-Regular.woff';

import { Helmet } from '@dr.pogodin/react-helmet';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, Routes } from 'react-router';

import styles from './app.module.scss';

import NotFound from 'components/NotFound/NotFound';
import Header from 'features/Header/Header';
import HomePage from 'features/HomePage/HomePage';

const Portfolio = (): React.JSX.Element => <main>Portfolio Page</main>;
const About = (): React.JSX.Element => <main>About Me Page</main>;
const Contact = (): React.JSX.Element => <main>Contact Page</main>;

const App = (): React.JSX.Element => {
    return (
        <div className={styles.app}>
            <Helmet>
                <title>piech.dev</title>
            </Helmet>
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
                <Routes>
                    <Route element={<HomePage />} path="/" />
                    <Route element={<Portfolio />} path="/portfolio" />
                    <Route element={<About />} path="/about" />
                    <Route element={<Contact />} path="/contact" />
                    <Route element={<NotFound />} path="*" />
                </Routes>
            </ErrorBoundary>
        </div>
    );
};

export default App;
