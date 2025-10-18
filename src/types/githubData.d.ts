export type RepositoryInfo = {
    name: string;
    description: string;
    topics?: string[];
    createdDatetime: string;
    lastCommitDatetime: string;
    license?: string;
    readme_content: string;
};

export type GithubData = {
    metadata?: { fetchedDatetime: string };
    repositories: Partial<Record<string, RepositoryInfo>>;
};

declare module '../../temp/githubData.json' {
    const value: GithubData;
    export default value;
}
