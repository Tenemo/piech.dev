/*
 - CLI usage: node --experimental-strip-types src/utils/build/fetchGithubData.ts [--refetch] [--allow-cache-fallback]
 - Programmatic usage: await fetchGithubData({ refetch?: boolean, allowCacheFallback?: boolean })
 - Writes temp/githubData.json with shape:
     {
         metadata: { fetchedDatetime: string },
         repositories: {
             [repo]: {
                 name: string,
                 description: string,
                 topics?: string[],
                 createdDatetime: string,
                 lastCommitDatetime: string,
                 defaultBranch?: string,
                 license?: string,
                 readme_content: string,
             }
         }
     }
*/

import fssync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import 'dotenv/config';
import { Octokit } from 'octokit';

import { GITHUB_OWNER } from '../../app/siteLinks.ts';
import { PROJECTS } from '../../features/Projects/projectsData.ts';

const OUT_DIR = path.join(process.cwd(), 'temp');
const OUT_PATH = path.join(OUT_DIR, 'githubData.json');
const EPOCH_ISO = '1970-01-01T00:00:00.000Z';
const README_NOT_FOUND = '# README not found\n';
const README_UNAVAILABLE = '# README unavailable\n';
const NO_ASSERTION_LICENSE = 'NOASSERTION';

type RepoInfo = {
    name: string;
    description: string;
    topics?: string[];
    createdDatetime: string;
    lastCommitDatetime: string;
    defaultBranch?: string;
    license?: string;
    readme_content: string;
};

export type GithubData = {
    metadata: { fetchedDatetime: string };
    repositories: Record<string, RepoInfo>;
};

type FetchGithubDataOptions = {
    refetch?: boolean;
    allowCacheFallback?: boolean;
};

type CacheState = {
    isFresh: boolean;
    isUsable: boolean;
};

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim() !== '';
}

function isValidIsoDatetime(value: unknown): value is string {
    return (
        isNonEmptyString(value) &&
        value !== EPOCH_ISO &&
        !Number.isNaN(Date.parse(value))
    );
}

function isValidRepositoryInfo(
    repoInfo: Partial<RepoInfo> | undefined,
): boolean {
    if (!repoInfo) {
        return false;
    }

    return (
        isNonEmptyString(repoInfo.name) &&
        typeof repoInfo.description === 'string' &&
        isValidIsoDatetime(repoInfo.createdDatetime) &&
        isValidIsoDatetime(repoInfo.lastCommitDatetime) &&
        isNonEmptyString(repoInfo.defaultBranch) &&
        isNonEmptyString(repoInfo.readme_content) &&
        repoInfo.readme_content !== README_NOT_FOUND &&
        repoInfo.readme_content !== README_UNAVAILABLE &&
        (repoInfo.topics === undefined ||
            (Array.isArray(repoInfo.topics) &&
                repoInfo.topics.every((topic) => isNonEmptyString(topic)))) &&
        (repoInfo.license === undefined || isNonEmptyString(repoInfo.license))
    );
}

function stringifyReason(reason: unknown): string {
    if (reason instanceof Error) {
        return reason.message;
    }

    try {
        return JSON.stringify(reason);
    } catch {
        return String(reason);
    }
}

function getErrorStatus(error: unknown): number | undefined {
    if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        typeof (error as { status?: unknown }).status === 'number'
    ) {
        return (error as { status: number }).status;
    }

    return undefined;
}

function normalizeLicense(
    license:
        | {
              spdx_id?: string | null;
              name?: string | null;
          }
        | null
        | undefined,
): string | undefined {
    if (!license) {
        return undefined;
    }

    if (license.spdx_id && license.spdx_id !== NO_ASSERTION_LICENSE) {
        return license.spdx_id;
    }

    return license.name ?? undefined;
}

function readCachedGithubData(
    repos: readonly string[],
): CacheState | undefined {
    if (!fssync.existsSync(OUT_PATH)) {
        return undefined;
    }

    try {
        const raw = fssync.readFileSync(OUT_PATH, 'utf8');
        const current = JSON.parse(raw) as Partial<GithubData>;
        const metaStr = current.metadata?.fetchedDatetime;
        const metaDate = metaStr ? new Date(metaStr) : undefined;
        const fileMtimeMs = fssync.statSync(OUT_PATH).mtime.getTime();
        const effectiveTimeMs =
            metaDate && !Number.isNaN(metaDate.getTime())
                ? metaDate.getTime()
                : fileMtimeMs;
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const repositories = current.repositories ?? {};
        const isComplete = repos.every((repo) => repo in repositories);
        const isUsable =
            isComplete &&
            repos.every((repo) => isValidRepositoryInfo(repositories[repo]));

        return {
            isFresh: Date.now() - effectiveTimeMs <= ONE_DAY_MS,
            isUsable,
        };
    } catch {
        return undefined;
    }
}

function createOctokit(token?: string): Octokit {
    return new Octokit({
        auth: token,
        userAgent: 'piech.dev-build',
    });
}

async function getReadme(octokit: Octokit, repo: string): Promise<string> {
    try {
        const response = await octokit.request(
            'GET /repos/{owner}/{repo}/readme',
            {
                owner: GITHUB_OWNER,
                repo,
                headers: {
                    accept: 'application/vnd.github.raw+json',
                },
            },
        );

        if (!isNonEmptyString(response.data)) {
            throw new Error(`Repository "${repo}" returned an empty README.`);
        }

        return response.data;
    } catch (error) {
        if (getErrorStatus(error) === 404) {
            throw new Error(`Repository "${repo}" is missing a README.`, {
                cause: error,
            });
        }

        throw new Error(
            `Failed to fetch README for "${repo}": ${stringifyReason(error)}`,
            {
                cause: error,
            },
        );
    }
}

async function getLastCommitDatetime(
    octokit: Octokit,
    repo: string,
    defaultBranch: string,
): Promise<string | undefined> {
    try {
        const response = await octokit.rest.repos.getCommit({
            owner: GITHUB_OWNER,
            repo,
            ref: defaultBranch,
        });

        return (
            response.data.commit.author?.date ??
            response.data.commit.committer?.date ??
            undefined
        );
    } catch {
        return undefined;
    }
}

async function buildRepositoryInfo(
    octokit: Octokit,
    repo: string,
): Promise<RepoInfo> {
    const [repoResult, topicsResult, readmeResult] = await Promise.allSettled([
        octokit.rest.repos.get({
            owner: GITHUB_OWNER,
            repo,
        }),
        octokit.rest.repos.getAllTopics({
            owner: GITHUB_OWNER,
            repo,
        }),
        getReadme(octokit, repo),
    ]);

    if (repoResult.status === 'rejected') {
        throw new Error(
            `Failed to fetch repository metadata for "${repo}": ${stringifyReason(repoResult.reason)}`,
        );
    }

    if (readmeResult.status === 'rejected') {
        throw new Error(stringifyReason(readmeResult.reason));
    }

    const topics =
        topicsResult.status === 'fulfilled'
            ? topicsResult.value.data.names
            : undefined;

    if (topicsResult.status === 'rejected') {
        console.warn(
            '[githubData] Topics fetch failed for',
            repo,
            stringifyReason(topicsResult.reason),
        );
    }

    const repository = repoResult.value.data;
    const defaultBranch = repository.default_branch;

    if (!isNonEmptyString(defaultBranch)) {
        throw new Error(
            `Repository "${repo}" is missing default branch metadata.`,
        );
    }

    if (!isValidIsoDatetime(repository.created_at)) {
        throw new Error(
            `Repository "${repo}" is missing a valid creation timestamp.`,
        );
    }

    const lastCommitDatetime = await getLastCommitDatetime(
        octokit,
        repo,
        defaultBranch,
    );
    const resolvedLastCommitDatetime =
        lastCommitDatetime ?? repository.pushed_at;

    if (!isValidIsoDatetime(resolvedLastCommitDatetime)) {
        throw new Error(
            `Repository "${repo}" is missing a valid last commit timestamp.`,
        );
    }

    return {
        name: repository.name,
        description: repository.description ?? 'No description available',
        createdDatetime: repository.created_at,
        lastCommitDatetime: resolvedLastCommitDatetime,
        defaultBranch,
        license: normalizeLicense(repository.license),
        readme_content: readmeResult.value,
        topics,
    };
}

export async function fetchGithubData(
    options?: FetchGithubDataOptions,
): Promise<void> {
    const allowCacheFallback = Boolean(options?.allowCacheFallback);
    const refetch = Boolean(options?.refetch);
    const repos = Array.from(new Set(PROJECTS.map((project) => project.repo)));
    const cacheState = readCachedGithubData(repos);

    if (!refetch && cacheState?.isUsable && cacheState.isFresh) {
        console.log('[githubData] Up-to-date and fresh file found, skipping.');
        return;
    }

    if (cacheState && !cacheState.isFresh) {
        console.log(
            '[githubData] Existing cache is older than a day; refetching.',
        );
    }

    if (cacheState && !cacheState.isUsable) {
        console.log(
            '[githubData] Existing cache is incomplete or degraded; refetching.',
        );
    }

    const token = process.env.PERSONAL_GITHUB_TOKEN ?? process.env.GH_TOKEN;
    const octokit = createOctokit(token);

    try {
        const repositoryEntries = await Promise.all(
            repos.map(
                async (repo): Promise<readonly [string, RepoInfo]> => [
                    repo,
                    await buildRepositoryInfo(octokit, repo),
                ],
            ),
        );
        const repositories: GithubData['repositories'] =
            Object.fromEntries(repositoryEntries);

        await fs.mkdir(OUT_DIR, { recursive: true });
        const payload: GithubData = {
            metadata: { fetchedDatetime: new Date().toISOString() },
            repositories,
        };
        await fs.writeFile(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
        console.log('[githubData] Wrote new format to', OUT_PATH);
    } catch (error) {
        if (allowCacheFallback && cacheState?.isUsable) {
            console.warn(
                '[githubData] Fetch failed, using the existing cache because cache fallback was explicitly enabled.',
                stringifyReason(error),
            );
            return;
        }

        throw error;
    }
}

if (
    import.meta.url ===
    (process.argv[1] && new URL(`file://${process.argv[1]}`).href)
) {
    const allowCacheFallback = process.argv.includes('--allow-cache-fallback');
    const refetch = process.argv.includes('--refetch');
    void fetchGithubData({ allowCacheFallback, refetch }).catch(
        (error: unknown) => {
            console.error('[githubData] Generation failed:', error);
            process.exitCode = 1;
        },
    );
}
