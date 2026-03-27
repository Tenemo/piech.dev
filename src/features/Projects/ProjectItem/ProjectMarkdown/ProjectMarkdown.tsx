import { format } from 'date-fns';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus.js';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, {
    defaultSchema,
    type Options as RehypeSanitizeSchema,
} from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import styles from './projectMarkdown.module.scss';

import { SILENT_CAPTIONS_TRACK_PATH } from 'app/appConstants';
import { findProjectByRepo } from 'features/Projects/projectUtils';
import { repositoriesData } from 'utils/data/githubData';

const OWNER = 'tenemo';
const GITHUB_USER_ATTACHMENT_PATTERN =
    /^https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+$/;
const MARKDOWN_HEADING_LINE_PATTERN = /^[ \t]{0,3}#{1,6}[ \t]+[^\r\n]+$/u;

function stringifyCodeChildren(children: React.ReactNode): string {
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

const sanitizedMarkdownSchema: RehypeSanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), 'source', 'track', 'video'],
    attributes: {
        ...defaultSchema.attributes,
        a: [...(defaultSchema.attributes?.a ?? []), 'rel', 'target', 'title'],
        img: [
            ...(defaultSchema.attributes?.img ?? []),
            'height',
            'title',
            'width',
        ],
        source: ['src', 'type'],
        track: ['default', 'kind', 'label', 'src', 'srclang'],
        video: [
            'autoPlay',
            'controls',
            'height',
            'loop',
            'muted',
            'playsInline',
            'poster',
            'preload',
            'src',
            'title',
            'width',
        ],
    },
};

const hasUrlScheme = (url: string): boolean =>
    /^[a-z][a-z\d+\-.]*:/i.test(url) || url.startsWith('//');

const isGithubUserAttachmentUrl = (url: string): boolean =>
    GITHUB_USER_ATTACHMENT_PATTERN.test(url);

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

const getLeadingMarkdownHeading = (markdown: string): string | undefined => {
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

const stripRedundantLeadingHeading = ({
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

const toRepositoryAssetUrl = ({
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
        `https://github.com/${OWNER}/${repo}/blob/${defaultBranch}/`,
    ).toString();

    return key === 'src' ? `${repositoryUrl}?raw=true` : repositoryUrl;
};

type ProjectMarkdownProps = {
    markdown: string;
    repo: string;
};

const ProjectMarkdown = ({
    markdown,
    repo,
}: ProjectMarkdownProps): React.JSX.Element => {
    const createdIso = repositoriesData[repo]?.createdDatetime;
    const defaultBranch = repositoriesData[repo]?.defaultBranch ?? 'master';
    const configuredProjectName = findProjectByRepo(repo)?.name;
    const leadingMarkdownHeading = getLeadingMarkdownHeading(markdown);
    const pageHeading =
        configuredProjectName ??
        leadingMarkdownHeading ??
        repositoriesData[repo]?.name ??
        repo;
    const markdownContent = stripRedundantLeadingHeading({
        markdown,
        comparisonCandidates: [
            pageHeading,
            repo,
            repositoriesData[repo]?.name ?? '',
        ],
    });
    const createdLabel = createdIso
        ? format(new Date(createdIso), 'MMMM yyyy')
        : undefined;

    const urlTransform = (
        url: string,
        key: string,
        _node: { type?: string } | null,
    ): string => {
        return toRepositoryAssetUrl({
            defaultBranch,
            key,
            repo,
            url,
        });
    };

    const components: Components = {
        pre({ children }) {
            return <>{children}</>;
        },
        code({ node: _node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '');
            return match ? (
                <SyntaxHighlighter
                    {...props}
                    aria-label={
                        match[1] ? `${match[1]} code example` : 'Code example'
                    }
                    className={styles.codeBlock}
                    language={match[1]}
                    // @ts-expect-error react-syntax-highlighter style typings are inaccurate
                    style={vscDarkPlus}
                    tabIndex={0}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {stringifyCodeChildren(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={styles.inlineCode} {...props}>
                    {children}
                </code>
            );
        },
        img({ node: _node, className, src, alt, ...props }) {
            return (
                <img
                    alt={alt}
                    className={
                        className
                            ? `${styles.markdownImage} ${className}`
                            : styles.markdownImage
                    }
                    decoding="async"
                    src={src}
                    {...props}
                />
            );
        },
        video({ node: _node, className, children, preload, ...props }) {
            const videoChildren = React.Children.toArray(children);
            const hasTrackChild = videoChildren.some(
                (child) =>
                    React.isValidElement(child) && child.type === 'track',
            );

            return (
                <video
                    className={
                        className
                            ? `${styles.videoPlayer} ${className}`
                            : styles.videoPlayer
                    }
                    preload={preload ?? 'metadata'}
                    {...props}
                >
                    {children}
                    {!hasTrackChild && (
                        <track
                            kind="captions"
                            label="No spoken audio"
                            src={SILENT_CAPTIONS_TRACK_PATH}
                            srcLang="en"
                        />
                    )}
                </video>
            );
        },
        a({ node: _node, href, children, ...props }) {
            if (href && isGithubUserAttachmentUrl(href)) {
                return (
                    <video
                        autoPlay
                        className={styles.videoPlayer}
                        controls
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        src={href}
                        title={
                            typeof children === 'string'
                                ? children
                                : 'Video attachment'
                        }
                    >
                        <track
                            kind="captions"
                            label="No spoken audio"
                            src={SILENT_CAPTIONS_TRACK_PATH}
                            srcLang="en"
                        />
                    </video>
                );
            }
            return (
                <a href={href} {...props}>
                    {children}
                </a>
            );
        },
    };

    return (
        <div className={styles.markdownContainer}>
            {createdLabel && (
                <time
                    aria-label={`Repository created: ${createdLabel}`}
                    className={styles.dateBadge}
                    dateTime={createdIso}
                    title="Month the project was kicked off in"
                >
                    Repository created: {createdLabel}
                </time>
            )}
            <h1>{pageHeading}</h1>
            <ReactMarkdown
                components={components}
                rehypePlugins={[
                    rehypeRaw,
                    [rehypeSanitize, sanitizedMarkdownSchema],
                ]}
                remarkPlugins={[remarkGfm]}
                urlTransform={urlTransform}
            >
                {markdownContent}
            </ReactMarkdown>
        </div>
    );
};

export default ProjectMarkdown;
