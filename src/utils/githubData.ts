import data from '../../temp/githubData.json';
import type { GithubData, RepositoryInfo } from '../types/github-data';

const githubData = data as GithubData;

export const REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>> =
    githubData.REPOSITORY_INFO;
export const README_CONTENT: Partial<Record<string, string>> =
    githubData.README_CONTENT;
