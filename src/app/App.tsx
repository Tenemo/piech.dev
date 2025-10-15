import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, Routes } from 'react-router';

import styles from './app.module.scss';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';
import About from 'features/About/About';
import Contact from 'features/Contact/Contact';
import Portfolio from 'features/Portfolio/Portfolio';
import PortfolioItem from 'features/Portfolio/PortfolioItem/PortfolioItem';

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
                <Routes>
                    <Route element={<About />} path="/" />
                    <Route element={<PortfolioItem />} path="/projects/:repo" />
                    <Route element={<Portfolio />} path="/projects" />
                    <Route element={<Contact />} path="/contact" />
                </Routes>
                <Footer />
            </ErrorBoundary>
        </div>
    );
};

export default App;
