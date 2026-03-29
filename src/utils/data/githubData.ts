import type { RepositoryInfo } from 'types/githubData';

type GithubDataFile = {
    repositories?: Partial<Record<string, RepositoryInfo>>;
};

const githubDataModules = import.meta.glob<GithubDataFile>(
    'temp/githubData.json',
    {
        eager: true,
        import: 'default',
    },
);

const githubData = Object.values(githubDataModules).at(0);

export const repositoriesData: Partial<Record<string, RepositoryInfo>> =
    githubData?.repositories ?? {};
