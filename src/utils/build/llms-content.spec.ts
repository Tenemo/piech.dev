import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';

import {
    PROJECTS,
    type ProjectDefinition,
} from '../../features/Projects/projectsData';

import { createLlmsFiles } from './llms-content';

const project: ProjectDefinition = {
    ...PROJECTS[0],
    name: 'piech.dev',
    repo: 'piech.dev',
};
const repository = {
    name: 'piech.dev',
    description: 'Tools for developers.',
    defaultBranch: 'release/docs',
    readme_content: '# piech.dev\n\nUseful documentation.',
};
const generate = (markdown: string): string =>
    createLlmsFiles([project], {
        repositories: {
            'piech.dev': { ...repository, readme_content: markdown },
        },
    }).get('projects/piech.dev/index.md') ?? '';

function getUrls(markdown: string): string[] {
    const urls: string[] = [];
    visit(unified().use(remarkParse).parse(markdown), (node) => {
        if (
            node.type === 'link' ||
            node.type === 'image' ||
            node.type === 'definition'
        )
            urls.push(node.url);
    });
    return urls;
}

describe('LLM content generation', () => {
    it('includes only configured projects, in order, with escaped Unicode metadata', () => {
        const projects = [
            { ...project, name: 'Żółć [tools]', repo: 'aliases.sh' },
            project,
        ];
        const files = createLlmsFiles(projects, {
            repositories: {
                'aliases.sh': {
                    ...repository,
                    description:
                        'First\n\n# injected [link](https://example.com)',
                },
                'piech.dev': repository,
                hidden: repository,
            },
        });
        const guide = files.get('llms.txt') ?? '';
        expect([...files.keys()]).toEqual([
            'projects/aliases.sh/index.md',
            'projects/piech.dev/index.md',
            'llms.txt',
        ]);
        expect(guide).toContain(
            '[Żółć \\[tools\\]](https://piech.dev/projects/aliases.sh/index.md)',
        );
        expect(guide).toContain(
            'First \\# injected \\[link\\](https://example.com)',
        );
        expect(guide).not.toContain('hidden');
        expect(guide.indexOf('/aliases.sh/')).toBeLessThan(
            guide.indexOf('/projects/piech.dev/'),
        );
        expect(files.get('projects/piech.dev/index.md')).toContain(
            'Technologies: TypeScript',
        );
    });

    it('resolves inline, reference, root-relative, and HTML URLs without changing code', () => {
        const code =
            '```html\n<img src="./code.png">\n[code](./unchanged.md)\n```';
        const markdown =
            '# piech.dev\n\n[Guide](./docs/guide.md?mode=1#usage)\n\n[Reference][guide]\n\n[guide]: /docs/reference.md\n\n![Preview](./preview.png?size=2#crop)\n\n<a href="./docs/start.md">Start</a>\n\n<video poster="./poster.png"><source src="./clip.mp4?download=1"></video>\n\n`[inline](./untouched.md)`\n\n' +
            code;
        const result = generate(markdown);
        expect(result).toContain(
            'https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/docs/guide.md?mode=1#usage',
        );
        expect(result).toContain(
            '[guide]: https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/docs/reference.md',
        );
        expect(getUrls(result)).toContain(
            'https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/preview.png?size=2&raw=true#crop',
        );
        expect(result).toContain(
            '<a href="https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/docs/start.md">Start</a>',
        );
        expect(result).toContain('poster.png?raw=true');
        expect(result).toContain('clip.mp4?download=1&amp;raw=true');
        expect(result).toContain('`[inline](./untouched.md)`');
        expect(result).toContain(code);
        expect(result.match(/^# piech\.dev$/gm)).toHaveLength(1);
    });

    it('resolves image references and preserves external media URLs', () => {
        const result = generate(
            '![Preview][preview]\n\n[preview]: ./preview.png?size=2#crop\n\n![Remote](https://example.com/image.png?size=2)',
        );
        expect(getUrls(result)).toContain(
            'https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/preview.png?size=2&raw=true#crop',
        );
        expect(result).toContain('(https://example.com/image.png?size=2)');
    });

    it.each(['source', 'img'])(
        'resolves every %s srcset candidate while preserving descriptors',
        (tag) => {
            const result = generate(
                `<${tag} srcset="./small.webp?size=2#crop 1x, /large.webp 2x" src="./fallback.webp">`,
            );
            expect(result).toContain(
                'srcset="https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/small.webp?size=2&amp;raw=true#crop 1x, https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/large.webp?raw=true 2x"',
            );
            expect(result).toContain(
                'src="https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/fallback.webp?raw=true"',
            );
        },
    );

    it('handles descriptor-free candidates, width descriptors, whitespace, and commas inside URLs', () => {
        const result = generate(
            '<img srcset="  ./small.webp,\n\t./wide.webp?colors=red,blue 640w, https://example.com/image,a.webp 1280w, //example.com/large.webp 1920w  ">',
        );
        expect(result.replace(/\s+/gu, ' ')).toContain(
            'srcset=" https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/small.webp?raw=true, https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/wide.webp?colors=red%2Cblue&amp;raw=true 640w, https://example.com/image,a.webp 1280w, https://example.com/large.webp 1920w "',
        );
    });

    it('preserves parenthesized descriptors and empty srcset attributes', () => {
        const result = generate(
            '<source srcset="./one.webp future(a,b), ./two.webp 2x"><img srcset="">',
        );
        expect(result).toContain(
            'one.webp?raw=true future(a,b), https://github.com/Tenemo/piech.dev/blob/release%2Fdocs/two.webp?raw=true 2x',
        );
        expect(result).toContain('<img srcset="">');
    });

    it.each([
        'data:image/png;base64,AAAA',
        'javascript:alert(1)',
        'file:///private.png',
    ])('rejects unsafe srcset candidate %s', (url) => {
        expect(() =>
            generate(`<source srcset="./safe.webp 1x, ${url} 2x">`),
        ).toThrow('Unsupported README URL protocol');
    });

    it('preserves srcset markup inside code examples', () => {
        const code =
            '\x60\x60\x60html\n<img srcset="./small.webp 1x, ./large.webp 2x">\n\x60\x60\x60';
        expect(generate(code)).toContain(code);
    });

    it('preserves external links, anchors, tables, and distinct README headings', () => {
        const result = generate(
            '# A different heading\n\n[API](https://example.com/api?q=1#part) [Contact](mailto:test@example.com) [Usage](#usage)\n\n![External](//example.com/image.png)\n\n| Name | Value |\n| --- | --- |\n| A | B |',
        );
        expect(result).toContain('# A different heading');
        expect(result).toContain('(https://example.com/api?q=1#part)');
        expect(result).toContain('(mailto:test@example.com)');
        expect(result).toContain('(#usage)');
        expect(result).toContain('(https://example.com/image.png)');
        expect(result).toMatch(/\| A\s+\| B\s+\|/u);
    });

    it.each([
        '../escape',
        '..',
        '.',
        '/absolute',
        'folder/repo',
        'C:\\escape',
        '%2e%2e',
        'repo?query',
        'repo#fragment',
    ])('rejects invalid repository path %s', (repo) => {
        expect(() =>
            createLlmsFiles([{ ...project, repo }], { repositories: {} }),
        ).toThrow('Invalid project repository path');
    });

    it.each([null, {}, { repositories: null }])(
        'rejects malformed cache %j',
        (cache) => {
            expect(() => createLlmsFiles([project], cache)).toThrow(
                'Invalid GitHub cache',
            );
        },
    );

    it.each([
        undefined,
        { ...repository, defaultBranch: '' },
        { ...repository, readme_content: ' ' },
        { ...repository, readme_content: '# README unavailable\n' },
    ])('rejects incomplete project data %j', (value) => {
        expect(() =>
            createLlmsFiles([project], {
                repositories: { 'piech.dev': value },
            }),
        ).toThrow('Missing or invalid GitHub data for piech.dev');
    });

    it.each([
        '[bad](javascript:alert%281%29)',
        '<a href="jav&#x61;script:alert(1)">Bad</a>',
        '![bad](data:image/svg+xml,test)',
        '<video poster="file:///private.png"></video>',
    ])('rejects unsafe URL protocols in %s', (markdown) => {
        expect(() => generate(markdown)).toThrow(
            'Unsupported README URL protocol',
        );
    });

    it('rejects duplicate project output paths', () => {
        expect(() =>
            createLlmsFiles([project, project], {
                repositories: { 'piech.dev': repository },
            }),
        ).toThrow('Duplicate project repository');
    });
});
