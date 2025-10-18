export type RepositoryInfo = {
    name: string;
    description: string;
    topics?: string[];
    createdDatetime: string;
    // ISO string of the last commit datetime on the default or known branch
    lastCommitDatetime?: string;
    // SPDX license string from package.json (if present)
    license?: string;
};

export type GithubData = {
    METADATA?: { fetchedDatetime: string };
    REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>>;
    README_CONTENT: Partial<Record<string, string>>;
};
