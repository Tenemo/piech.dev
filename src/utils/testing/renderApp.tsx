import * as TestingLibraryReact from '@testing-library/react';
import React, { ReactElement } from 'react';
import { BrowserRouter } from 'react-router';

type CustomRenderOptions = {
    withRouter?: boolean;
} & Omit<TestingLibraryReact.RenderOptions, 'wrapper'>;

export const renderApp = (
    ui: ReactElement,
    { withRouter = true, ...renderOptions }: CustomRenderOptions = {},
): ReturnType<typeof TestingLibraryReact.render> => {
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

    return TestingLibraryReact.render(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    });
};
