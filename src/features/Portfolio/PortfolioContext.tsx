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
    setPackageInfo: (project: string, info: PackageInfo) => void;
    getPackageInfo: (project: string) => PackageInfo | undefined;
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

    const contextValue = useMemo(
        () => ({
            packageInfoCache,
            setPackageInfo,
            getPackageInfo,
        }),
        [getPackageInfo, packageInfoCache],
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
