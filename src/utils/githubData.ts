import data from '../../temp/githubData.json';
import type { GithubData } from '../types/github-data';

const ghData = data;

export const REPOSITORY_INFO: GithubData['REPOSITORY_INFO'] =
    ghData.REPOSITORY_INFO;
export const README_CONTENT: GithubData['README_CONTENT'] =
    ghData.README_CONTENT;
