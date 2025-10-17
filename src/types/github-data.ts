export type RepositoryInfo = {
    name: string;
    description: string;
    topics?: string[];
    createdDatetime: string;
};

export type GithubData = {
    METADATA?: { fetchedDatetime: string };
    REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>>;
    README_CONTENT: Partial<Record<string, string>>;
};
