// temp/githubData.json is generated before build and kept in the repo's temp dir.
// A file-level disable avoids false positives both when the file exists locally
// and when lint runs before generation in a fresh environment.

/* eslint-disable */
import githubData from '../../../temp/githubData.json';
import type { RepositoryInfo } from 'types/githubData';
/* eslint-enable */

export const repositoriesData: Partial<Record<string, RepositoryInfo>> =
    githubData.repositories;
