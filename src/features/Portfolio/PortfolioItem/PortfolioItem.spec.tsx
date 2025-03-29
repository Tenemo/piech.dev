import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PortfolioProvider } from '../PortfolioContext';

import PortfolioItem from './PortfolioItem';

import { renderWithProviders } from 'utils/testUtils';

const mockedFetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        text: () => Promise.resolve('# Test Readme Content'),
        statusText: 'OK',
    }),
);

vi.stubGlobal('fetch', mockedFetch);

const mockUseParams = vi.fn().mockReturnValue({ repo: 'test-repo' });
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...(actual as object),
        useParams: () => mockUseParams() as { repo?: string },
    };
});

describe('PortfolioItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedFetch.mockClear();
        mockUseParams.mockReturnValue({ repo: 'test-repo' });
        console.error = vi.fn();
        document.title = '';
    });

    it('should render with the correct structure when data is loaded', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve('# Test Readme Content'),
            statusText: 'OK',
        });

        renderWithProviders(<PortfolioItem />, {
            withRouter: true,
            withPortfolio: true,
        });

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

        const headingElement = await screen.findByRole('heading', { level: 1 });
        expect(headingElement).toHaveTextContent('Test Readme Content');

        expect(screen.getByText(/back to portfolio/i)).toBeInTheDocument();
        expect(
            screen.getByText(/github.com\/tenemo\/test-repo/i),
        ).toBeInTheDocument();
    });

    it('should show loading state while fetching readme', () => {
        mockedFetch.mockImplementationOnce(
            () =>
                new Promise(() => {
                    return;
                }),
        );

        renderWithProviders(<PortfolioItem />, {
            withRouter: true,
            withPortfolio: true,
        });

        expect(
            screen.getByText(/loading repository information/i),
        ).toBeInTheDocument();
    });

    it('should display error message when fetch fails', async () => {
        mockedFetch.mockRejectedValueOnce(new Error('Fetch error'));

        renderWithProviders(<PortfolioItem />, {
            withRouter: true,
            withPortfolio: true,
        });

        const errorHeading = await screen.findByText(
            /error loading repository/i,
        );
        expect(errorHeading).toBeInTheDocument();

        const errorMessage = await screen.findByText(/fetch error/i);
        expect(errorMessage).toBeInTheDocument();
    });

    it('should display error message when response is not ok', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Not Found',
            text: () => Promise.resolve(''),
        });

        renderWithProviders(<PortfolioItem />, {
            withRouter: true,
            withPortfolio: true,
        });

        const errorHeading = await screen.findByText(
            /error loading repository/i,
        );
        expect(errorHeading).toBeInTheDocument();

        const errorMessage = await screen.findByText(
            /failed to fetch readme: not found/i,
        );
        expect(errorMessage).toBeInTheDocument();
    });

    it('should use cached readme content when available', async () => {
        const Wrapper = ({
            children,
        }: {
            children: React.ReactNode;
        }): React.JSX.Element => (
            <PortfolioProvider>{children}</PortfolioProvider>
        );

        mockUseParams.mockReturnValue({ repo: 'cached-project' });

        mockedFetch.mockImplementation(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('# Cached Readme Content'),
                statusText: 'OK',
            }),
        );

        const { rerender } = renderWithProviders(
            <Wrapper>
                <PortfolioItem />
            </Wrapper>,
            { withRouter: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalledTimes(1);
        });

        const firstHeading = await screen.findByRole('heading', { level: 1 });
        expect(firstHeading).toHaveTextContent('Cached Readme Content');

        mockedFetch.mockClear();

        mockUseParams.mockReturnValue({ repo: 'test-repo' });

        rerender(
            <Wrapper>
                <PortfolioItem />
            </Wrapper>,
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalledTimes(1);
        });

        mockUseParams.mockReturnValue({ repo: 'cached-project' });

        mockedFetch.mockClear();

        rerender(
            <Wrapper>
                <PortfolioItem />
            </Wrapper>,
        );

        await screen.findByRole('heading', { level: 1 });
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Cached Readme Content',
        );
        expect(mockedFetch).not.toHaveBeenCalled();
    });

    it('should save readme content to context', async () => {
        const Wrapper = ({
            children,
        }: {
            children: React.ReactNode;
        }): React.JSX.Element => (
            <PortfolioProvider>{children}</PortfolioProvider>
        );

        mockUseParams.mockReturnValue({ repo: 'new-content-project' });

        mockedFetch.mockImplementation(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('# New Readme Content'),
                statusText: 'OK',
            }),
        );

        const { rerender } = renderWithProviders(
            <Wrapper>
                <PortfolioItem />
            </Wrapper>,
            { withRouter: true },
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalledTimes(1);
        });

        const firstHeading = await screen.findByRole('heading', { level: 1 });
        expect(firstHeading).toHaveTextContent('New Readme Content');

        mockedFetch.mockClear();

        mockUseParams.mockReturnValue({ repo: 'test-repo' });

        rerender(
            <Wrapper>
                <PortfolioItem />
            </Wrapper>,
        );

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalledTimes(1);
        });

        mockUseParams.mockReturnValue({ repo: 'new-content-project' });

        mockedFetch.mockClear();

        rerender(
            <Wrapper>
                <PortfolioItem />
            </Wrapper>,
        );

        await screen.findByRole('heading', { level: 1 });
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'New Readme Content',
        );
        expect(mockedFetch).not.toHaveBeenCalled();
    });

    it('should handle case when repo parameter is missing', async () => {
        mockUseParams.mockReturnValue({});

        renderWithProviders(<PortfolioItem />, {
            withRouter: true,
            withPortfolio: true,
        });

        const errorHeading = await screen.findByText(
            /error loading repository/i,
        );
        expect(errorHeading).toBeInTheDocument();

        const errorMessage = await screen.findByText(
            /repository information is missing/i,
        );
        expect(errorMessage).toBeInTheDocument();
    });

    it('should have correct GitHub link', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve('# Test Readme Content'),
            statusText: 'OK',
        });

        renderWithProviders(<PortfolioItem />, {
            withRouter: true,
            withPortfolio: true,
        });

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

        const githubLink = screen.getByRole('link', {
            name: /github\.com\/tenemo\/test-repo/i,
        });

        expect(githubLink).toHaveAttribute(
            'href',
            'https://github.com/tenemo/test-repo',
        );
        expect(githubLink).toHaveAttribute('target', '_blank');
        expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should set document title based on repo name', async () => {
        const originalDocumentTitle = document.title;

        const originalUseEffect = React.useEffect;
        const mockUseEffect = vi
            .spyOn(React, 'useEffect')
            .mockImplementation((effect) => {
                originalUseEffect(effect);
            });

        mockedFetch.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve('# Test Readme Content'),
            statusText: 'OK',
        });

        renderWithProviders(<PortfolioItem />, {
            withRouter: true,
            withPortfolio: true,
        });

        await waitFor(() => {
            expect(document.title).toBe('test-repo | piech.dev');
        });

        mockUseEffect.mockRestore();
        document.title = originalDocumentTitle;
    });
});
