import 'normalize.css';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Route, Routes } from 'react-router';

import styles from './app.module.scss';

import ExternalRedirect from 'components/ExternalRedirect/ExternalRedirect';
import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';
import NotFound from 'components/NotFound/NotFound';
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
                    <Route
                        element={<Navigate replace to="/about" />}
                        path="/"
                    />
                    <Route
                        element={
                            <ExternalRedirect url="https://www.linkedin.com/in/ppiech/" />
                        }
                        path="/linkedin"
                    />
                    <Route
                        element={
                            <ExternalRedirect url="https://github.com/Tenemo" />
                        }
                        path="/github"
                    />
                    <Route
                        element={<ExternalRedirect url="https://t.me/tenemo" />}
                        path="/telegram"
                    />
                    <Route
                        element={<PortfolioItem />}
                        path="/portfolio/:repo"
                    />
                    <Route element={<Portfolio />} path="/portfolio" />
                    <Route element={<About />} path="/about" />
                    <Route element={<Contact />} path="/contact" />
                    <Route element={<NotFound />} path="*" />
                </Routes>
                <Footer />
            </ErrorBoundary>
        </div>
    );
};

export default App;
