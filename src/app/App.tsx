import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router';

import { MAIN_CONTENT_ID } from './accessibility';
import { ensureTrailingSlash } from './routePaths';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';

const App = (): React.JSX.Element => {
    const location = useLocation();
    const skipLinkHref = `${ensureTrailingSlash(location.pathname)}#${MAIN_CONTENT_ID}`;

    return (
        <>
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
                <a className="skipLink" href={skipLinkHref}>
                    Skip to main content
                </a>
                <Header />
                <Outlet />
                <Footer />
            </ErrorBoundary>
        </>
    );
};

export default App;
