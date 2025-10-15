// Disabling the rule not to require the JSON file
// to be preset for linting during CI
// eslint-disable-next-line import/no-unresolved
import data from '../../temp/gitHubData.json';

import type { RepositoryInfo } from 'types/github-data';

const githubData = data;

export const REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>> =
    githubData.REPOSITORY_INFO;
export const README_CONTENT: Partial<Record<string, string>> =
    githubData.README_CONTENT;
