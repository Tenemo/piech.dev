import { defaultTreeAdapter, parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import {
    getProjectMarkdownPath,
    getProjectPath,
} from '../../app/routePaths.ts';
import { SITE_LINKS } from '../../app/siteLinks.ts';
import type { ProjectDefinition } from '../../features/Projects/projectsData.ts';
import { TECHNOLOGIES } from '../../features/Projects/technologies.ts';
import {
    stripRedundantLeadingHeading,
    toRepositoryAssetUrl,
} from '../markdown-content.ts';

type RepositoryContent = {
    name: string;
    description: string;
    defaultBranch: string;
    readme_content: string;
};

const markdownProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStringify);

const escapeText = (text: string): string =>
    text
        .replace(/\s+/gu, ' ')
        .trim()
        .replace(/[\\`*_[\]<>#]/gu, '\\$&');

function resolveRepositoryUrl(
    url: string,
    repo: string,
    defaultBranch: string,
    media: boolean,
): string {
    if (url.startsWith('#')) return url;
    const absolute = toRepositoryAssetUrl({
        url: url.startsWith('/') && !url.startsWith('//') ? `.${url}` : url,
        repo,
        defaultBranch: encodeURIComponent(defaultBranch),
        key: media ? 'src' : 'href',
    });
    const resolved = new URL(
        absolute.startsWith('//') ? `https:${absolute}` : absolute,
    );
    if (
        !['https:', 'http:', ...(media ? [] : ['mailto:'])].includes(
            resolved.protocol,
        )
    ) {
        throw new Error(
            `Unsupported README URL protocol in ${repo}: ${resolved.protocol}`,
        );
    }
    return resolved.href;
}

function rewriteSourceSet(
    value: string,
    repo: string,
    defaultBranch: string,
): string {
    let offset = 0;
    let rewritten = '';
    // Follow HTML srcset token boundaries: commas can belong to URLs or parenthesized descriptors.
    // https://html.spec.whatwg.org/multipage/images.html#parsing-a-srcset-attribute
    while (offset < value.length) {
        const separatorStart = offset;
        while (offset < value.length && /[\t\n\f\r ,]/u.test(value[offset]))
            offset += 1;
        rewritten += value.slice(separatorStart, offset);
        if (offset === value.length) break;

        const urlStart = offset;
        while (offset < value.length && !/[\t\n\f\r ]/u.test(value[offset]))
            offset += 1;
        let urlEnd = offset;
        while (value[urlEnd - 1] === ',') urlEnd -= 1;
        rewritten += resolveRepositoryUrl(
            value.slice(urlStart, urlEnd),
            repo,
            defaultBranch,
            true,
        );
        rewritten += value.slice(urlEnd, offset);
        if (urlEnd !== offset) continue;

        const descriptorStart = offset;
        let inParentheses = false;
        while (offset < value.length) {
            const character = value[offset];
            offset += 1;
            if (character === ')') inParentheses = false;
            else if (character === '(') inParentheses = true;
            else if (character === ',' && !inParentheses) break;
        }
        rewritten += value.slice(descriptorStart, offset);
    }
    return rewritten;
}

function rewriteHtml(
    html: string,
    repo: string,
    defaultBranch: string,
): string {
    const fragment = parseFragment(html, { sourceCodeLocationInfo: true });
    const replacements: { start: number; end: number; text: string }[] = [];
    function walk(node: DefaultTreeAdapterMap['node']): void {
        if (defaultTreeAdapter.isElementNode(node)) {
            for (const attribute of node.attrs) {
                if (
                    !['href', 'src', 'poster', 'srcset'].includes(
                        attribute.name,
                    )
                )
                    continue;
                const location =
                    node.sourceCodeLocation?.attrs?.[attribute.name];
                if (!location)
                    throw new Error(
                        `Missing HTML attribute location in ${repo}`,
                    );
                const url =
                    attribute.name === 'srcset'
                        ? rewriteSourceSet(attribute.value, repo, defaultBranch)
                        : resolveRepositoryUrl(
                              attribute.value,
                              repo,
                              defaultBranch,
                              attribute.name !== 'href',
                          );
                replacements.push({
                    start: location.startOffset,
                    end: location.endOffset,
                    text: `${attribute.name}="${url.replace(/&/gu, '&amp;').replace(/"/gu, '&quot;').replace(/</gu, '&lt;')}"`,
                });
            }
            if (node.tagName === 'template' && 'content' in node)
                walk(defaultTreeAdapter.getTemplateContent(node));
        }
        if ('childNodes' in node) node.childNodes.forEach(walk);
    }
    walk(fragment);
    return replacements
        .sort((left, right) => right.start - left.start)
        .reduce(
            (value, replacement) =>
                value.slice(0, replacement.start) +
                replacement.text +
                value.slice(replacement.end),
            html,
        );
}

export function createProjectMarkdown(
    project: ProjectDefinition,
    repository: RepositoryContent,
): string {
    const markdown = stripRedundantLeadingHeading({
        markdown: repository.readme_content,
        comparisonCandidates: [project.name, project.repo, repository.name],
    });
    const tree = markdownProcessor.parse(markdown);
    const imageDefinitions = new Set<string>();
    visit(tree, 'imageReference', (node) => {
        imageDefinitions.add(node.identifier);
    });
    visit(tree, (node) => {
        if (
            node.type === 'link' ||
            node.type === 'image' ||
            node.type === 'definition'
        ) {
            node.url = resolveRepositoryUrl(
                node.url,
                project.repo,
                repository.defaultBranch,
                node.type === 'image' ||
                    (node.type === 'definition' &&
                        imageDefinitions.has(node.identifier)),
            );
        } else if (node.type === 'html') {
            node.value = rewriteHtml(
                node.value,
                project.repo,
                repository.defaultBranch,
            );
        }
    });
    return (
        [
            `# ${escapeText(project.name)}`,
            escapeText(repository.description),
            `[Project page](${new URL(getProjectPath(project.repo), SITE_LINKS.home).href}) | [GitHub repository](${SITE_LINKS.githubProfile}/${project.repo})`,
            `Technologies: ${project.technologies.map((technology) => escapeText(TECHNOLOGIES[technology].fullName)).join(', ')}`,
            markdownProcessor.stringify(tree).trimEnd(),
        ].join('\n\n') + '\n'
    );
}

function readRepository(value: unknown, repo: string): RepositoryContent {
    if (
        typeof value !== 'object' ||
        value === null ||
        !('name' in value) ||
        typeof value.name !== 'string' ||
        !value.name.trim() ||
        !('description' in value) ||
        typeof value.description !== 'string' ||
        !('defaultBranch' in value) ||
        typeof value.defaultBranch !== 'string' ||
        !value.defaultBranch.trim() ||
        !('readme_content' in value) ||
        typeof value.readme_content !== 'string' ||
        !value.readme_content.trim() ||
        ['# README not found', '# README unavailable'].includes(
            value.readme_content.trim(),
        )
    ) {
        throw new Error(
            `Missing or invalid GitHub data for ${repo}; refresh the GitHub cache before generating llms.txt.`,
        );
    }
    return {
        name: value.name,
        description: value.description,
        defaultBranch: value.defaultBranch,
        readme_content: value.readme_content,
    };
}

export function createLlmsFiles(
    projects: readonly ProjectDefinition[],
    cache: unknown,
): Map<string, string> {
    if (
        typeof cache !== 'object' ||
        cache === null ||
        !('repositories' in cache) ||
        typeof cache.repositories !== 'object' ||
        cache.repositories === null
    ) {
        throw new Error('Invalid GitHub cache: expected repositories.');
    }
    const repositories = new Map(Object.entries(cache.repositories));
    const files = new Map<string, string>();
    const projectLinks: string[] = [];
    for (const project of projects) {
        if (
            !/^[a-zA-Z0-9_.-]+$/u.test(project.repo) ||
            ['.', '..'].includes(project.repo)
        ) {
            throw new Error(`Invalid project repository path: ${project.repo}`);
        }
        const markdownPath = getProjectMarkdownPath(project.repo);
        if (files.has(markdownPath.slice(1)))
            throw new Error(`Duplicate project repository: ${project.repo}`);
        const repository = readRepository(
            repositories.get(project.repo),
            project.repo,
        );
        files.set(
            markdownPath.slice(1),
            createProjectMarkdown(project, repository),
        );
        projectLinks.push(
            `- [${escapeText(project.name)}](${new URL(markdownPath, SITE_LINKS.home).href}): ${escapeText(repository.description)}`,
        );
    }
    files.set(
        'llms.txt',
        [
            '# piech.dev',
            '> Piotr Piech’s personal website and software project portfolio.',
            'Project documents contain repository descriptions, technologies, and READMEs from the same build as the website.',
            '## Projects',
            projectLinks.join('\n'),
            '## Contact',
            `- [Email](${SITE_LINKS.email}): Contact Piotr Piech.\n- [GitHub](${SITE_LINKS.githubProfile}): Public repositories.\n- [LinkedIn](${SITE_LINKS.linkedin}): Professional profile.\n- [Telegram](${SITE_LINKS.telegram}): Contact Piotr Piech.`,
        ].join('\n\n') + '\n',
    );
    return files;
}
