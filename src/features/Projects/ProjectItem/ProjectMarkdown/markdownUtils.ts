import React from 'react';

import { GITHUB_OWNER } from 'app/siteLinks';

const MARKDOWN_HEADING_LINE_PATTERN = /^[ \t]{0,3}#{1,6}[ \t]+[^\r\n]+$/u;

export function stringifyCodeChildren(children: React.ReactNode): string {
    if (typeof children === 'string') {
        return children;
    }

    if (!Array.isArray(children)) {
        return '';
    }

    return children
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('');
}

export const hasUrlScheme = (url: string): boolean =>
    /^[a-z][a-z\d+\-.]*:/i.test(url) || url.startsWith('//');

const normalizeHeadingForComparison = (value: string): string =>
    value
        .normalize('NFKD')
        .replace(/[`*_~[\]()]/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/[^a-z0-9]+/gi, '')
        .toLowerCase();

const getNextMarkdownLine = (
    markdown: string,
    offset: number,
): {
    line: string;
    nextOffset: number;
} => {
    const nextLineBreak = markdown.indexOf('\n', offset);
    const rawLine =
        nextLineBreak === -1
            ? markdown.slice(offset)
            : markdown.slice(offset, nextLineBreak);

    return {
        line: rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine,
        nextOffset: nextLineBreak === -1 ? markdown.length : nextLineBreak + 1,
    };
};

const extractMarkdownHeadingFromLine = (line: string): string | undefined => {
    if (!MARKDOWN_HEADING_LINE_PATTERN.exec(line)) {
        return undefined;
    }

    const trimmedLine = line.trimStart();
    let hashCount = 0;

    while (trimmedLine[hashCount] === '#') {
        hashCount += 1;
    }

    let headingText = trimmedLine.slice(hashCount).trim();
    let markerStart = headingText.length;

    while (markerStart > 0 && headingText[markerStart - 1] === '#') {
        markerStart -= 1;
    }

    if (
        markerStart < headingText.length &&
        (headingText[markerStart - 1] === ' ' ||
            headingText[markerStart - 1] === '\t')
    ) {
        headingText = headingText.slice(0, markerStart).trimEnd();
    }

    return headingText.length > 0 ? headingText : undefined;
};

export const getLeadingMarkdownHeading = (
    markdown: string,
): string | undefined => {
    const markdownWithoutBom = markdown.startsWith('\uFEFF')
        ? markdown.slice(1)
        : markdown;
    let offset = 0;

    while (offset < markdownWithoutBom.length) {
        const { line, nextOffset } = getNextMarkdownLine(
            markdownWithoutBom,
            offset,
        );

        if (line.trim().length === 0) {
            offset = nextOffset;
            continue;
        }

        return extractMarkdownHeadingFromLine(line);
    }

    return undefined;
};

const trimLeadingBlankLines = (value: string): string => {
    let offset = 0;

    while (offset < value.length) {
        const nextLineBreak = value.indexOf('\n', offset);
        const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
        const line = value.slice(offset, lineEnd).replace(/\r$/u, '');

        if (line.trim().length > 0) {
            return value.slice(offset);
        }

        offset = nextLineBreak === -1 ? value.length : nextLineBreak + 1;
    }

    return '';
};

export const stripRedundantLeadingHeading = ({
    markdown,
    comparisonCandidates,
}: {
    markdown: string;
    comparisonCandidates: readonly string[];
}): string => {
    const markdownWithoutBom = markdown.startsWith('\uFEFF')
        ? markdown.slice(1)
        : markdown;
    let offset = 0;

    while (offset < markdownWithoutBom.length) {
        const { line, nextOffset } = getNextMarkdownLine(
            markdownWithoutBom,
            offset,
        );

        if (line.trim().length === 0) {
            offset = nextOffset;
            continue;
        }

        const headingText = extractMarkdownHeadingFromLine(line);

        if (!headingText) {
            return markdown;
        }

        const normalizedHeading = normalizeHeadingForComparison(headingText);
        const isRedundantHeading = comparisonCandidates.some(
            (candidate) =>
                normalizeHeadingForComparison(candidate) === normalizedHeading,
        );

        if (!isRedundantHeading) {
            return markdown;
        }

        return trimLeadingBlankLines(markdownWithoutBom.slice(nextOffset));
    }

    return markdownWithoutBom;
};

export const toRepositoryAssetUrl = ({
    url,
    repo,
    defaultBranch,
    key,
}: {
    url: string;
    repo: string;
    defaultBranch: string;
    key: string;
}): string => {
    if (hasUrlScheme(url) || url.startsWith('#')) {
        return url;
    }

    const repositoryUrl = new URL(
        url,
        `https://github.com/${GITHUB_OWNER}/${repo}/blob/${defaultBranch}/`,
    ).toString();

    return key === 'src' ? `${repositoryUrl}?raw=true` : repositoryUrl;
};
