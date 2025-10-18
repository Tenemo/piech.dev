export type RepositoryInfo = {
    name: string;
    description: string;
    topics?: string[];
    createdDatetime: string;
    lastCommitDatetime: string; // must always be present
    license?: string;
    readme_content: string;
};

export type GithubData = {
    metadata?: { fetchedDatetime: string };
    repositories: Partial<Record<string, RepositoryInfo>>;
};
