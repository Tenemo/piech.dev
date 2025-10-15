export type RepositoryInfo = {
    name: string;
    description: string;
    topics?: string[];
};

export type GithubData = {
    METADATA?: { datetimeFetched: string };
    REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>>;
    README_CONTENT: Partial<Record<string, string>>;
};
