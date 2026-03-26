import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router';

import { MAIN_CONTENT_ID } from './accessibility';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';

const App = (): React.JSX.Element => {
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
                <a className="skipLink" href={`#${MAIN_CONTENT_ID}`}>
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
