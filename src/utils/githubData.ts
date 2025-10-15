// Disabling the rule not to require the JSON file
// to be preset for linting during CI.
// We can't use eslint-disable-next-line import/no-unresolved,
// because it will trigger eslint's error about unused
// eslint disables (reportUnusedDisableDirectives)
// if the file is actually present, like during CD or local development.
// We are triggering another error by not having a line separating errors.

/* eslint-disable */
import githubData from '../../temp/githubData.json';
import type { RepositoryInfo } from 'types/github-data';
/* eslint-enable */

export const REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>> =
    githubData.REPOSITORY_INFO;
export const README_CONTENT: Partial<Record<string, string>> =
    githubData.README_CONTENT;
