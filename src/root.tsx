// src/root.tsx
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import React from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { PortfolioProvider } from 'features/Portfolio/PortfolioContext';
import 'normalize.css';
import 'styles/global.scss';

declare const __BUILD_DATE__: string;

export const Layout = ({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element => {
    const FrameworkReady: React.FC<{ children: React.ReactNode }> = ({
        children: frameworkChildren,
    }) => {
        // On the server, always render
        if (typeof window === 'undefined')
            return frameworkChildren as React.JSX.Element;
        // In the browser, ensure React Router framework context has been injected
        // before rendering framework-bound components like <Meta/>, <Links/>, etc.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        const hasContext = Boolean((window as any).__reactRouterContext);
        return hasContext ? (frameworkChildren as React.JSX.Element) : null;
    };
    return (
        <html lang="en">
            <head>
                <meta content="piotr@piech.dev" name="author" />
                <meta content="Piotr's personal page." name="description" />
                <meta
                    content="piotr, piech, piotr piech, reactplate, react, typescript, elgamal, threshold-elgamal"
                    name="keywords"
                />
                <meta content="piech.dev" property="og:title" />
                <meta
                    content="Piotr's personal page."
                    property="og:description"
                />
                <meta content="https://piech.dev" property="og:url" />
                <meta content="follow" name="robots" />
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" />
                <meta
                    content="width=device-width, initial-scale=1, shrink-to-fit=no"
                    name="viewport"
                />
                <base href="/" />
                <link href="https://github.com" rel="preconnect" />
                <link href="https://github.com" rel="dns-prefetch" />
                <link
                    href="https://raw.githubusercontent.com"
                    rel="preconnect"
                />
                <link
                    href="https://raw.githubusercontent.com"
                    rel="dns-prefetch"
                />
                <link
                    href="/favicon/favicon-96x96.png"
                    rel="icon"
                    sizes="96x96"
                    type="image/png"
                />
                <link
                    href="/favicon/favicon.svg"
                    rel="icon"
                    type="image/svg+xml"
                />
                <link href="/favicon/favicon.ico" rel="shortcut icon" />
                <link
                    href="/favicon/apple-touch-icon.png"
                    rel="apple-touch-icon"
                    sizes="180x180"
                />
                <meta content="piech.dev" name="apple-mobile-web-app-title" />
                <link href="/favicon/site.webmanifest" rel="manifest" />
                {/* LCP image */}
                <link
                    as="image"
                    fetchPriority="high"
                    href="/media/projects/threshold-elgamal.webp"
                    rel="preload"
                    type="image/webp"
                />
                <title>piech.dev</title>
                <FrameworkReady>
                    <Meta />
                    <Links />
                </FrameworkReady>
            </head>
            <body>
                {children}
                <FrameworkReady>
                    <ScrollRestoration />
                    <Scripts />
                </FrameworkReady>
            </body>
        </html>
    );
};

const Root = (): React.JSX.Element => {
    React.useEffect(() => {
        document.body.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });
        document.body.addEventListener('keydown', (event) => {
            if (event.key === 'Tab')
                document.body.classList.remove('using-mouse');
        });
        console.log(`Build date: ${__BUILD_DATE__}`);
    }, []);

    return (
        <HelmetProvider>
            <PortfolioProvider>
                <Outlet />
            </PortfolioProvider>
        </HelmetProvider>
    );
};

export default Root;
