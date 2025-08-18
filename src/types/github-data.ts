export type RepositoryInfo = {
    name: string;
    description: string;
};

export type GithubData = {
    REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>>;
    README_CONTENT: Partial<Record<string, string>>;
};
