/* eslint-disable import/no-unresolved */
// Disabling the rule not to require the JSON file
// to be preset for linting during CI.
// We can't use eslint-disable-next-line import/no-unresolved,
// because it will trigger eslint's error about unused
// eslint disables (reportUnusedDisableDirectives)
// if the file is actually present, like during CD or local development.

import gitHubData from '../../temp/gitHubData.json';
/* eslint-enable import/no-unresolved */

import type { RepositoryInfo } from 'types/github-data';

export const REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>> =
    gitHubData.REPOSITORY_INFO;
export const README_CONTENT: Partial<Record<string, string>> =
    gitHubData.README_CONTENT;
