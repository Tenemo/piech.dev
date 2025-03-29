import { HelmetProvider } from '@dr.pogodin/react-helmet';
import * as Sentry from '@sentry/react';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter,
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes,
    Route,
    Routes,
} from 'react-router';

import App from 'app/App';
import { PortfolioProvider } from 'features/Portfolio/PortfolioContext';

import 'styles/global.scss';

declare const __BUILD_DATE__: string;

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
let SentryRoutes: ReturnType<
    typeof Sentry.withSentryReactRouterV7Routing
> | null = null;

if (sentryDsn) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
            Sentry.reactRouterV7BrowserTracingIntegration({
                useEffect: useEffect,
                useLocation,
                useNavigationType,
                createRoutesFromChildren,
                matchRoutes,
            }),
        ],
        tracesSampleRate: 1.0,
    });
    SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);
}

export const Root = (): React.JSX.Element => {
    useEffect(() => {
        // https://stackoverflow.com/questions/31402576/enable-focus-only-on-keyboard-use-or-tab-press
        document.body.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });
        document.body.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });
        console.log(`Build date: ${__BUILD_DATE__}`);
    }, []);

    return (
        <React.StrictMode>
            <HelmetProvider>
                <PortfolioProvider>
                    <BrowserRouter>
                        {SentryRoutes ? (
                            <SentryRoutes>
                                <Route element={<App />} path="*" />
                            </SentryRoutes>
                        ) : (
                            <Routes>
                                <Route element={<App />} path="*" />
                            </Routes>
                        )}
                    </BrowserRouter>
                </PortfolioProvider>
            </HelmetProvider>
        </React.StrictMode>
    );
};

const container = document.getElementById('root');

if (!container) {
    throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<Root />);
