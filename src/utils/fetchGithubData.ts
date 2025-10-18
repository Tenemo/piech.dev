/*
 - CLI usage: node --experimental-strip-types src/utils/fetchGithubData.ts [--refetch]
 - Programmatic usage: await fetchGithubData({ refetch?: boolean })
 - Writes temp/githubData.json with shape:
     {
         METADATA: { fetchedDatetime: string },
         REPOSITORY_INFO: { [repo]: { name, description, topics?: string[], createdDatetime: string } },
         README_CONTENT: { [repo]: markdown }
     }
*/

import fssync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const OWNER = 'tenemo';
const BRANCHES = ['master', 'main'] as const;
const OUT_DIR = path.join(process.cwd(), 'temp');
const OUT_PATH = path.join(OUT_DIR, 'githubData.json');
const PROJECTS_FILE = path.join(
    process.cwd(),
    'src',
    'features',
    'Projects',
    'projectsList.ts',
);

type RepoInfo = {
    name: string;
    description: string;
    topics?: string[];
    createdDatetime: string;
    lastCommitDatetime?: string;
    license?: string;
};
export type GithubData = {
    METADATA: { fetchedDatetime: string };
    REPOSITORY_INFO: Record<string, RepoInfo>;
    README_CONTENT: Record<string, string>;
};

function parseReposFromProjectsFile(text: string): string[] {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) return [];
    const body = text.slice(start + 1, end);
    const blocks = body
        .split(/\},\s*\{/g)
        .map((b, i, arr) =>
            i === 0 ? b + '}' : i === arr.length - 1 ? '{' + b : '{' + b + '}',
        );
    const repos = new Set<string>();
    for (const block of blocks) {
        const projectMatch = /project:\s*'([^']+)'/.exec(block);
        if (!projectMatch) continue;
        const project = projectMatch[1];
        const repoNameMatch = /repoName:\s*'([^']+)'/.exec(block);
        const repo = repoNameMatch ? repoNameMatch[1] : project;
        repos.add(repo);
    }
    return Array.from(repos);
}

async function fetchJson<T>(url: string, token?: string): Promise<T> {
    const headers: Record<string, string> = {
        'User-Agent': 'piech.dev-build',
        Accept: 'application/vnd.github+json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok)
        throw new Error(
            String(res.status) + ' ' + res.statusText + ' for ' + url,
        );
    return (await res.json()) as T;
}

async function fetchText(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'piech.dev-build' },
    });
    if (!res.ok)
        throw new Error(
            String(res.status) + ' ' + res.statusText + ' for ' + url,
        );
    return await res.text();
}

function stringifyReason(reason: unknown): string {
    if (reason instanceof Error) return reason.message;
    try {
        return JSON.stringify(reason);
    } catch {
        return String(reason);
    }
}

async function getReadme(owner: string, repo: string): Promise<string> {
    for (const branch of BRANCHES) {
        try {
            return await fetchText(
                `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
            );
        } catch {
            // try next branch
        }
    }
    return '# README not found\n';
}

async function getPackageJsonLicenseFromMaster(
    owner: string,
    repo: string,
): Promise<string | undefined> {
    // Spec: license from package.json on master HEAD commit, if present.
    // We intentionally only check the 'master' branch as requested,
    // and do not fallback to 'main' here.
    try {
        const raw = await fetchText(
            `https://raw.githubusercontent.com/${owner}/${repo}/master/package.json`,
        );
        try {
            const pkg = JSON.parse(raw) as unknown;
            if (
                pkg &&
                typeof pkg === 'object' &&
                'license' in (pkg as Record<string, unknown>)
            ) {
                const lic = (pkg as Record<string, unknown>).license;
                if (typeof lic === 'string') return lic;
                if (
                    lic &&
                    typeof lic === 'object' &&
                    'type' in (lic as Record<string, unknown>) &&
                    typeof (lic as Record<string, unknown>).type === 'string'
                )
                    return (lic as Record<string, unknown>).type as string;
            }
            // Support legacy `licenses` array
            if (pkg && typeof pkg === 'object') {
                const anyPkg = pkg as Record<string, unknown>;
                const licensesRaw = anyPkg.licenses;
                if (Array.isArray(licensesRaw) && licensesRaw.length > 0) {
                    const first = licensesRaw[0] as { type?: unknown };
                    if (typeof first.type === 'string') return first.type;
                }
            }
        } catch {
            // ignore JSON parsing errors and fall through
        }
    } catch {
        // master/package.json not found or inaccessible
    }
    return undefined;
}

async function getLastCommitDatetime(
    owner: string,
    repo: string,
    token: string | undefined,
    branch: string,
): Promise<string | undefined> {
    // Use the commits API to get the head commit for the branch.
    // If this fails (e.g. branch doesn't exist), callers will try fallbacks.
    try {
        const res = await fetchJson<{
            sha: string;
            commit?: { author?: { date?: string } };
        }>(
            `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
            token,
        );
        const date = res.commit?.author?.date;
        return typeof date === 'string' ? date : undefined;
    } catch {
        return undefined;
    }
}

export async function fetchGithubData(options?: {
    refetch?: boolean;
}): Promise<void> {
    const refetch = Boolean(options?.refetch);
    const token = process.env.PERSONAL_GITHUB_TOKEN ?? process.env.GH_TOKEN;

    const projectsText = await fs.readFile(PROJECTS_FILE, 'utf8');
    const repos = parseReposFromProjectsFile(projectsText);

    if (fssync.existsSync(OUT_PATH)) {
        try {
            const raw = fssync.readFileSync(OUT_PATH, 'utf8');
            const current = JSON.parse(raw) as Partial<GithubData>;

            // Determine if the file is older than one day
            const metaStr = current.METADATA?.fetchedDatetime;
            const metaDate = metaStr ? new Date(metaStr) : undefined;
            const fileMtimeMs = fssync.statSync(OUT_PATH).mtime.getTime();
            const effectiveTimeMs =
                metaDate && !isNaN(metaDate.getTime())
                    ? metaDate.getTime()
                    : fileMtimeMs;
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const olderThanOneDay = Date.now() - effectiveTimeMs > ONE_DAY_MS;

            const infoKeys = Object.keys(current.REPOSITORY_INFO ?? {});
            const readmeKeys = Object.keys(current.README_CONTENT ?? {});
            const complete = repos.every(
                (r) => infoKeys.includes(r) && readmeKeys.includes(r),
            );
            if (!refetch && complete && !olderThanOneDay) {
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
        } catch {
            // fall-through to regenerate
        }
    }

    const infoObject: Record<string, RepoInfo> = {};
    const readmeObject: Record<string, string> = {};

    const MAX_CONCURRENCY = Number(process.env.GH_CONCURRENCY ?? 8);
    const EPOCH_ISO = '1970-01-01T00:00:00.000Z';

    const worker = async (repo: string): Promise<void> => {
        // Fetch repo info and README concurrently
        const [infoRes, topicsRes, readmeRes] = await Promise.allSettled([
            fetchJson<{
                name?: string;
                description?: string;
                created_at?: string;
                default_branch?: string;
            }>(`https://api.github.com/repos/${OWNER}/${repo}`, token),
            fetchJson<{ names?: string[] }>(
                `https://api.github.com/repos/${OWNER}/${repo}/topics`,
                token,
            ),
            getReadme(OWNER, repo),
        ]);

        if (infoRes.status === 'fulfilled') {
            const repoData = infoRes.value;
            // Attempt to populate lastCommitDatetime using the default branch when available.
            let lastCommitDatetime: string | undefined;
            if (repoData.default_branch) {
                lastCommitDatetime = await getLastCommitDatetime(
                    OWNER,
                    repo,
                    token,
                    repoData.default_branch,
                );
            } else {
                // Fallback to trying known branch names.
                for (const b of BRANCHES) {
                    lastCommitDatetime = await getLastCommitDatetime(
                        OWNER,
                        repo,
                        token,
                        b,
                    );
                    if (lastCommitDatetime) break;
                }
            }

            // License from master/package.json only (per spec)
            const license = await getPackageJsonLicenseFromMaster(OWNER, repo);

            infoObject[repo] = {
                name: repoData.name ?? repo,
                description: repoData.description ?? 'No description available',
                createdDatetime: repoData.created_at ?? EPOCH_ISO,
                lastCommitDatetime,
                license,
                topics:
                    topicsRes.status === 'fulfilled'
                        ? (topicsRes.value.names ?? [])
                        : undefined,
            };
        } else {
            // Even if repo info failed, still attempt best-effort for lastCommitDatetime and license
            let lastCommitDatetime: string | undefined;
            for (const b of BRANCHES) {
                // Try known branches; ignore failures
                const maybe = await getLastCommitDatetime(
                    OWNER,
                    repo,
                    token,
                    b,
                );
                if (maybe) {
                    lastCommitDatetime = maybe;
                    break;
                }
            }
            const license = await getPackageJsonLicenseFromMaster(OWNER, repo);

            infoObject[repo] = {
                name: repo,
                description: 'No description available',
                // Fallback to epoch to make failures obvious
                createdDatetime: EPOCH_ISO,
                lastCommitDatetime,
                license,
                topics:
                    topicsRes.status === 'fulfilled'
                        ? (topicsRes.value.names ?? [])
                        : undefined,
            };
            // infoRes is rejected here; log a safe stringified reason
            console.warn(
                '[githubData] Repo info failed for',
                repo,
                stringifyReason(infoRes.reason),
            );
        }

        if (topicsRes.status === 'rejected') {
            console.warn(
                '[githubData] Topics fetch failed for',
                repo,
                stringifyReason(topicsRes.reason),
            );
        }

        if (readmeRes.status === 'fulfilled') {
            readmeObject[repo] = readmeRes.value;
        } else {
            readmeObject[repo] = '# README unavailable\n';
            console.warn(
                '[githubData] README fetch failed for',
                repo,
                stringifyReason(readmeRes.reason),
            );
        }
    };

    if (repos.length <= MAX_CONCURRENCY) {
        await Promise.all(repos.map((r) => worker(r)));
    } else {
        // Simple concurrency pool
        let index = 0;
        const runners = Array.from({ length: MAX_CONCURRENCY }, async () => {
            while (index < repos.length) {
                const current = index++;
                const repo = repos[current];
                await worker(repo);
            }
        });
        await Promise.all(runners);
    }

    await fs.mkdir(OUT_DIR, { recursive: true });
    const payload: GithubData = {
        METADATA: { fetchedDatetime: new Date().toISOString() },
        REPOSITORY_INFO: infoObject,
        README_CONTENT: readmeObject,
    };
    await fs.writeFile(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
    console.log('[githubData] Wrote', OUT_PATH);
}

// CLI
if (
    import.meta.url ===
    (process.argv[1] && new URL('file://' + process.argv[1]).href)
) {
    const refetch = process.argv.includes('--refetch');
    void fetchGithubData({ refetch }).catch((e: unknown) => {
        console.error('[githubData] Generation failed:', e);
        process.exitCode = 1;
    });
}
