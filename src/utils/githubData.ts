// Disabling the rule not to require the JSON file
// to be preset for linting during CI.
// We can't use eslint-disable-next-line import/no-unresolved,
// because it will trigger eslint's error about unused
// eslint disables (reportUnusedDisableDirectives)
// if the file is actually present, like during CD or local development.
// We are triggering another error by not having a line separating errors.

/* eslint-disable */
import githubData from '../../temp/githubData.json';
import type { GithubData, RepositoryInfo } from 'types/github-data';
/* eslint-enable */

const typed: GithubData = githubData as unknown as GithubData;

export const REPOSITORIES: Partial<Record<string, RepositoryInfo>> =
    typed.repositories;
export const METADATA: GithubData['metadata'] = typed.metadata;
