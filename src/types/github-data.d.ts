declare module '../../temp/githubData' {
    export type RepositoryInfo = { name: string; description: string };
    export const REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>>;
    export const README_CONTENT: Partial<Record<string, string>>;
}

declare module '../../../../temp/githubData' {
    export type RepositoryInfo = { name: string; description: string };
    export const REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>>;
    export const README_CONTENT: Partial<Record<string, string>>;
}
