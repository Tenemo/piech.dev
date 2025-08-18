import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { Config } from '@react-router/dev/config';

import { PROJECTS } from './src/features/Portfolio/projects';

const OWNER = 'tenemo';
const BRANCHES = ['master', 'main'];

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

async function generateGithubData(): Promise<void> {
    const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    const repos = PROJECTS.map((p) => p.repoName ?? p.project);

    const infoObject: Record<string, { name: string; description: string }> =
        {};
    const readmeObject: Record<string, string> = {};

    for (const repo of repos) {
        try {
            const repoData = await fetchJson<{
                name?: string;
                description?: string;
            }>(`https://api.github.com/repos/${OWNER}/${repo}`, token);

            infoObject[repo] = {
                name: repoData.name ?? repo,
                description: repoData.description ?? 'No description available',
            };

            readmeObject[repo] = await getReadme(OWNER, repo);
        } catch (err) {
            infoObject[repo] = {
                name: repo,
                description: 'No description available',
            };
            readmeObject[repo] = '# README unavailable\n';
            console.warn('[build] GitHub fetch failed for', repo, err);
        }
    }

    const outDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, 'githubData.ts');
    const file =
        `// AUTO-GENERATED at build time. Do not edit by hand.\n` +
        `// Source: react-router.config.ts -> generateGithubData()\n` +
        `export type RepositoryInfo = { name: string; description: string };\n` +
        `export const REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>> = ${JSON.stringify(
            infoObject,
            null,
            2,
        )} as Partial<Record<string, RepositoryInfo>>;\n` +
        `export const README_CONTENT: Partial<Record<string, string>> = ${JSON.stringify(
            readmeObject,
            null,
            2,
        )} as Partial<Record<string, string>>;\n`;
    await fs.writeFile(outPath, file, 'utf8');
}

export default {
    appDirectory: 'src',
    buildDirectory: 'dist',
    ssr: false,
    async prerender() {
        // Generate GitHub data module for static rendering.
        await generateGithubData();
        const staticPaths = ['/', '/portfolio', '/contact'];
        const itemPaths = PROJECTS.map(
            (p) => `/portfolio/${p.repoName ?? p.project}`,
        );
        return [...staticPaths, ...itemPaths];
    },
} satisfies Config;
