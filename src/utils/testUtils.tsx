// Not true, it's there
// eslint-disable-next-line import/named
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { BrowserRouter } from 'react-router';
type CustomRenderOptions = {
    withRouter?: boolean;
} & Omit<RenderOptions, 'wrapper'>;

export const renderWithProviders = (
    ui: ReactElement,
    { withRouter = true, ...renderOptions }: CustomRenderOptions = {},
): ReturnType<typeof render> => {
    const Wrapper = ({
        children,
    }: {
        children: React.ReactNode;
    }): React.JSX.Element => {
        let wrappedChildren = children;
        if (withRouter)
            wrappedChildren = <BrowserRouter>{wrappedChildren}</BrowserRouter>;
        return <>{wrappedChildren}</>;
    };
    return render(ui, { wrapper: Wrapper, ...renderOptions });
};
