import * as Sentry from '@sentry/react';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import {
    createRoutesFromChildren,
    matchRoutes,
    useLocation,
    useNavigationType,
} from 'react-router';
import { HydratedRouter } from 'react-router/dom';

const dsn = import.meta.env.VITE_SENTRY_DSN;
if (dsn) {
    Sentry.init({
        dsn,
        integrations: [
            Sentry.reactRouterV7BrowserTracingIntegration({
                useEffect: React.useEffect,
                useLocation,
                useNavigationType,
                createRoutesFromChildren,
                matchRoutes,
            }),
        ],
        tracesSampleRate: 1.0,
    });
}

hydrateRoot(
    document,
    <React.StrictMode>
        <HydratedRouter />
    </React.StrictMode>,
);
