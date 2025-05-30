import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
    useMemo,
    useCallback,
} from 'react';

export type RepositoryInfo = {
    name: string;
    description: string;
};

type PortfolioContextType = {
    repositoryInfoCache: Record<string, RepositoryInfo>;
    readmeContentCache: Record<string, string>;
    setRepositoryInfo: (project: string, info: RepositoryInfo) => void;
    getRepositoryInfo: (project: string) => RepositoryInfo | undefined;
    setReadmeContent: (project: string, content: string) => void;
    getReadmeContent: (project: string) => string | undefined;
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(
    undefined,
);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [repositoryInfoCache, setRepositoryInfoCache] = useState<
        Record<string, RepositoryInfo>
    >({});
    const [readmeContentCache, setReadmeContentCache] = useState<
        Record<string, string>
    >({});

    const setRepositoryInfo = (project: string, info: RepositoryInfo): void => {
        setRepositoryInfoCache((prev) => ({
            ...prev,
            [project]: info,
        }));
    };

    const getRepositoryInfo = useCallback(
        (project: string): RepositoryInfo | undefined =>
            repositoryInfoCache[project],
        [repositoryInfoCache],
    );

    const setReadmeContent = (project: string, content: string): void => {
        setReadmeContentCache((prev) => ({
            ...prev,
            [project]: content,
        }));
    };

    const getReadmeContent = useCallback(
        (project: string): string | undefined => readmeContentCache[project],
        [readmeContentCache],
    );

    const contextValue = useMemo(
        () => ({
            repositoryInfoCache,
            readmeContentCache,
            setRepositoryInfo,
            getRepositoryInfo,
            setReadmeContent,
            getReadmeContent,
        }),
        [
            getRepositoryInfo,
            getReadmeContent,
            repositoryInfoCache,
            readmeContentCache,
        ],
    );

    return (
        <PortfolioContext.Provider value={contextValue}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = (): PortfolioContextType => {
    const context = useContext(PortfolioContext);
    if (context === undefined) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
};
