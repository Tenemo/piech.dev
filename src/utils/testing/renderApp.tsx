// eslint-plugin-import mis-detects this named export in the installed version.
// eslint-disable-next-line import/named
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { BrowserRouter } from 'react-router';

type CustomRenderOptions = {
    withRouter?: boolean;
} & Omit<RenderOptions, 'wrapper'>;

export const renderApp = (
    ui: ReactElement,
    { withRouter = true, ...renderOptions }: CustomRenderOptions = {},
): ReturnType<typeof render> => {
    const Wrapper = ({
        children,
    }: {
        children: React.ReactNode;
    }): React.JSX.Element =>
        withRouter ? (
            <BrowserRouter>{children}</BrowserRouter>
        ) : (
            <>{children}</>
        );

    return render(ui, { wrapper: Wrapper, ...renderOptions });
};
