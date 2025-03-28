import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
    useMemo,
    useCallback,
} from 'react';

export type PackageInfo = {
    name: string;
    description: string;
};

type PortfolioContextType = {
    packageInfoCache: Record<string, PackageInfo>;
    readmeContentCache: Record<string, string>;
    setPackageInfo: (project: string, info: PackageInfo) => void;
    getPackageInfo: (project: string) => PackageInfo | undefined;
    setReadmeContent: (project: string, content: string) => void;
    getReadmeContent: (project: string) => string | undefined;
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(
    undefined,
);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [packageInfoCache, setPackageInfoCache] = useState<
        Record<string, PackageInfo>
    >({});
    const [readmeContentCache, setReadmeContentCache] = useState<
        Record<string, string>
    >({});

    const setPackageInfo = (project: string, info: PackageInfo): void => {
        setPackageInfoCache((prev) => ({
            ...prev,
            [project]: info,
        }));
    };

    const getPackageInfo = useCallback(
        (project: string): PackageInfo | undefined => packageInfoCache[project],
        [packageInfoCache],
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
            packageInfoCache,
            readmeContentCache,
            setPackageInfo,
            getPackageInfo,
            setReadmeContent,
            getReadmeContent,
        }),
        [
            getPackageInfo,
            getReadmeContent,
            packageInfoCache,
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
