/*
 - CLI usage: node --experimental-strip-types src/utils/build/fetchGithubData.ts [--refetch]
 - Programmatic usage: await fetchGithubData({ refetch?: boolean })
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

function isFallbackRepositoryInfo(
    repoInfo: Partial<RepoInfo> | undefined,
): boolean {
    if (!repoInfo) {
        return true;
    }

    return (
        repoInfo.readme_content === README_UNAVAILABLE ||
        repoInfo.createdDatetime === EPOCH_ISO ||
        repoInfo.lastCommitDatetime === EPOCH_ISO
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

        return typeof response.data === 'string'
            ? response.data
            : README_NOT_FOUND;
    } catch (error) {
        if (getErrorStatus(error) === 404) {
            return README_NOT_FOUND;
        }

        throw error;
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

    const readmeContent =
        readmeResult.status === 'fulfilled'
            ? readmeResult.value
            : README_UNAVAILABLE;

    if (readmeResult.status === 'rejected') {
        console.warn(
            '[githubData] README fetch failed for',
            repo,
            stringifyReason(readmeResult.reason),
        );
    }

    if (topicsResult.status === 'rejected') {
        console.warn(
            '[githubData] Topics fetch failed for',
            repo,
            stringifyReason(topicsResult.reason),
        );
    }

    const topics =
        topicsResult.status === 'fulfilled'
            ? topicsResult.value.data.names
            : undefined;

    if (repoResult.status === 'rejected') {
        console.warn(
            '[githubData] Repo info failed for',
            repo,
            stringifyReason(repoResult.reason),
        );

        return {
            name: repo,
            description: 'No description available',
            createdDatetime: EPOCH_ISO,
            lastCommitDatetime: EPOCH_ISO,
            readme_content: readmeContent,
            topics,
        };
    }

    const repository = repoResult.value.data;
    const lastCommitDatetime = await getLastCommitDatetime(
        octokit,
        repo,
        repository.default_branch,
    );

    return {
        name: repository.name,
        description: repository.description ?? 'No description available',
        createdDatetime: repository.created_at,
        lastCommitDatetime: lastCommitDatetime ?? repository.pushed_at,
        defaultBranch: repository.default_branch,
        license: normalizeLicense(repository.license),
        readme_content: readmeContent,
        topics,
    };
}

export async function fetchGithubData(options?: {
    refetch?: boolean;
}): Promise<void> {
    const refetch = Boolean(options?.refetch);
    const repos = Array.from(new Set(PROJECTS.map((project) => project.repo)));

    if (fssync.existsSync(OUT_PATH)) {
        try {
            const raw = fssync.readFileSync(OUT_PATH, 'utf8');
            const current = JSON.parse(raw) as Partial<GithubData>;
            const metaStr = current.metadata?.fetchedDatetime;
            const metaDate = metaStr ? new Date(metaStr) : undefined;
            const fileMtimeMs = fssync.statSync(OUT_PATH).mtime.getTime();
            const effectiveTimeMs =
                metaDate && !isNaN(metaDate.getTime())
                    ? metaDate.getTime()
                    : fileMtimeMs;
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const olderThanOneDay = Date.now() - effectiveTimeMs > ONE_DAY_MS;
            const repositories = current.repositories ?? {};
            const infoKeys = Object.keys(repositories);
            const complete = repos.every((repo) => infoKeys.includes(repo));
            const hasFallbackData = repos.some((repo) =>
                isFallbackRepositoryInfo(repositories[repo]),
            );

            if (!refetch && complete && !olderThanOneDay && !hasFallbackData) {
                console.log(
                    '[githubData] Up-to-date and fresh file found, skipping.',
                );
                return;
            }

            if (olderThanOneDay) {
                console.log(
                    '[githubData] Existing file is older than a day; refetching.',
                );
            }

            if (hasFallbackData) {
                console.log(
                    '[githubData] Existing file contains fallback GitHub data; refetching.',
                );
            }
        } catch {
            // Rebuild the file if parsing the cache fails.
        }
    }

    const token = process.env.PERSONAL_GITHUB_TOKEN ?? process.env.GH_TOKEN;
    const octokit = createOctokit(token);
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
}

if (
    import.meta.url ===
    (process.argv[1] && new URL(`file://${process.argv[1]}`).href)
) {
    const refetch = process.argv.includes('--refetch');
    void fetchGithubData({ refetch }).catch((error: unknown) => {
        console.error('[githubData] Generation failed:', error);
        process.exitCode = 1;
    });
}
