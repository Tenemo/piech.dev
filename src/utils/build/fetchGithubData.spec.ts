// @vitest-environment node

import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PROJECTS } from 'features/Projects/projectsData';
import type { RepositoryInfo } from 'types/githubData';

const octokitMocks = {
    getCommit: vi.fn(),
    getAllTopics: vi.fn(),
    reposGet: vi.fn(),
    request: vi.fn(),
};

vi.mock('octokit', () => ({
    Octokit: class {
        public readonly rest = {
            repos: {
                get: octokitMocks.reposGet,
                getAllTopics: octokitMocks.getAllTopics,
                getCommit: octokitMocks.getCommit,
            },
        };

        public readonly request = octokitMocks.request;
    },
}));

type GithubDataFile = {
    metadata: { fetchedDatetime: string };
    repositories: Record<string, RepositoryInfo>;
};

type RepoParams = {
    repo: string;
};

const UNIQUE_REPOS = Array.from(
    new Set(PROJECTS.map((project) => project.repo)),
);
const README_UNAVAILABLE = '# README unavailable\n';
const TEMP_DIRECTORIES: string[] = [];

async function createWorkspace(): Promise<string> {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'piech-dev-fetch-'));
    TEMP_DIRECTORIES.push(directory);
    await mkdir(path.join(directory, 'temp'), { recursive: true });
    return directory;
}

function createRepositoryInfo(repo: string): RepositoryInfo {
    return {
        name: repo,
        description: `Description for ${repo}`,
        createdDatetime: '2024-01-01T00:00:00.000Z',
        defaultBranch: 'main',
        lastCommitDatetime: '2024-02-02T00:00:00.000Z',
        license: 'MIT',
        readme_content: `# ${repo}\n\nRepository README.`,
        topics: ['portfolio', 'typescript'],
    };
}

function createCachePayload(): GithubDataFile {
    return {
        metadata: {
            fetchedDatetime: new Date().toISOString(),
        },
        repositories: Object.fromEntries(
            UNIQUE_REPOS.map((repo) => [repo, createRepositoryInfo(repo)]),
        ),
    };
}

async function writeCache(
    workspace: string,
    payload: GithubDataFile,
): Promise<void> {
    await writeFile(
        path.join(workspace, 'temp', 'githubData.json'),
        JSON.stringify(payload, null, 2),
        'utf8',
    );
}

async function loadFetchGithubDataModule(
    workspace: string,
): Promise<typeof import('./fetchGithubData')> {
    vi.resetModules();
    vi.spyOn(process, 'cwd').mockReturnValue(workspace);
    return import('./fetchGithubData');
}

async function readGithubDataFile(workspace: string): Promise<GithubDataFile> {
    const payload = await readFile(
        path.join(workspace, 'temp', 'githubData.json'),
        'utf8',
    );

    return JSON.parse(payload) as GithubDataFile;
}

function seedSuccessfulOctokitResponses(): void {
    octokitMocks.reposGet.mockImplementation(({ repo }: RepoParams) =>
        Promise.resolve({
            data: {
                created_at: '2024-01-01T00:00:00.000Z',
                default_branch: 'main',
                description: `Description for ${repo}`,
                license: { spdx_id: 'MIT' },
                name: repo,
                pushed_at: '2024-02-01T00:00:00.000Z',
            },
        }),
    );
    octokitMocks.getAllTopics.mockResolvedValue({
        data: {
            names: ['portfolio', 'typescript'],
        },
    });
    octokitMocks.getCommit.mockResolvedValue({
        data: {
            commit: {
                author: { date: '2024-02-02T00:00:00.000Z' },
                committer: { date: '2024-02-01T00:00:00.000Z' },
            },
        },
    });
    octokitMocks.request.mockImplementation(
        (_route: string, { repo }: RepoParams) =>
            Promise.resolve({
                data: `# ${repo}\n\nRepository README.`,
            }),
    );
}

describe('fetchGithubData', () => {
    beforeEach(() => {
        octokitMocks.getCommit.mockReset();
        octokitMocks.getAllTopics.mockReset();
        octokitMocks.reposGet.mockReset();
        octokitMocks.request.mockReset();
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();

        while (TEMP_DIRECTORIES.length > 0) {
            const directory = TEMP_DIRECTORIES.pop();

            if (!directory) {
                continue;
            }

            await rm(directory, {
                force: true,
                recursive: true,
            });
        }
    });

    it('writes fetched GitHub data when all required repository metadata is available', async () => {
        const workspace = await createWorkspace();
        seedSuccessfulOctokitResponses();
        const { fetchGithubData } = await loadFetchGithubDataModule(workspace);

        await fetchGithubData({ refetch: true });

        const payload = await readGithubDataFile(workspace);

        expect(Object.keys(payload.repositories).sort()).toEqual(
            [...UNIQUE_REPOS].sort(),
        );
        expect(payload.repositories['piech.dev']).toMatchObject({
            createdDatetime: '2024-01-01T00:00:00.000Z',
            defaultBranch: 'main',
            description: 'Description for piech.dev',
            lastCommitDatetime: '2024-02-02T00:00:00.000Z',
            readme_content: '# piech.dev\n\nRepository README.',
        });
    });

    it('fails when a required README cannot be fetched and cache fallback is not enabled', async () => {
        const workspace = await createWorkspace();
        seedSuccessfulOctokitResponses();
        octokitMocks.request.mockImplementation(
            (_route: string, { repo }: RepoParams) => {
                if (repo === UNIQUE_REPOS[0]) {
                    return Promise.reject(
                        new Error('GitHub readme endpoint failed'),
                    );
                }

                return Promise.resolve({
                    data: `# ${repo}\n\nRepository README.`,
                });
            },
        );
        const { fetchGithubData } = await loadFetchGithubDataModule(workspace);

        await expect(fetchGithubData({ refetch: true })).rejects.toThrow(
            /Failed to fetch README/,
        );
        await expect(
            readFile(path.join(workspace, 'temp', 'githubData.json'), 'utf8'),
        ).rejects.toThrow();
    });

    it('uses the existing cache only when cache fallback is explicitly enabled', async () => {
        const workspace = await createWorkspace();
        const cachedPayload = createCachePayload();
        await writeCache(workspace, cachedPayload);
        octokitMocks.reposGet.mockRejectedValue(
            new Error('GitHub unavailable'),
        );
        octokitMocks.getAllTopics.mockResolvedValue({
            data: {
                names: ['portfolio', 'typescript'],
            },
        });
        octokitMocks.getCommit.mockResolvedValue({
            data: {
                commit: {
                    author: { date: '2024-02-02T00:00:00.000Z' },
                },
            },
        });
        octokitMocks.request.mockResolvedValue({
            data: '# README\n\nRepository README.',
        });
        const { fetchGithubData } = await loadFetchGithubDataModule(workspace);

        await expect(
            fetchGithubData({ allowCacheFallback: true, refetch: true }),
        ).resolves.toBeUndefined();

        const payload = await readGithubDataFile(workspace);

        expect(payload).toEqual(cachedPayload);
    });

    it('rejects degraded cache data instead of silently reusing it as fallback', async () => {
        const workspace = await createWorkspace();
        const degradedPayload = createCachePayload();
        degradedPayload.repositories[UNIQUE_REPOS[0]].readme_content =
            README_UNAVAILABLE;
        await writeCache(workspace, degradedPayload);
        octokitMocks.reposGet.mockRejectedValue(
            new Error('GitHub unavailable'),
        );
        octokitMocks.getAllTopics.mockResolvedValue({
            data: {
                names: ['portfolio', 'typescript'],
            },
        });
        octokitMocks.getCommit.mockResolvedValue({
            data: {
                commit: {
                    author: { date: '2024-02-02T00:00:00.000Z' },
                },
            },
        });
        octokitMocks.request.mockResolvedValue({
            data: '# README\n\nRepository README.',
        });
        const { fetchGithubData } = await loadFetchGithubDataModule(workspace);

        await expect(
            fetchGithubData({ allowCacheFallback: true, refetch: true }),
        ).rejects.toThrow(/Failed to fetch repository metadata/);
    });
});
