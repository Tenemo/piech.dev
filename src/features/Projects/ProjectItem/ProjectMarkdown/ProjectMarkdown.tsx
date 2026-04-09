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

import {
    getLeadingMarkdownHeading,
    stringifyCodeChildren,
    stripRedundantLeadingHeading,
    toRepositoryAssetUrl,
} from './markdownUtils';
import styles from './projectMarkdown.module.scss';

import {
    PROJECT_DATE_FORMAT,
    SILENT_CAPTIONS_TRACK_PATH,
} from 'app/appConstants';
import { findProjectByRepo } from 'features/Projects/projectUtils';
import { repositoriesData } from 'utils/data/githubData';
import { isGithubUserAttachmentUrl } from 'utils/githubUrls';

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

type ProjectMarkdownProps = {
    markdown: string;
    repo: string;
};

const BADGE_IMAGE_ORIGINS = new Set([
    'https://api.netlify.com',
    'https://badge.fury.io',
    'https://d25lcipzij17d.cloudfront.net',
    'https://img.shields.io',
]);

function isBadgeImageUrl(src: string | undefined): boolean {
    if (!src) {
        return false;
    }

    try {
        const normalizedUrl = src.startsWith('//') ? `https:${src}` : src;
        const url = new URL(normalizedUrl);

        if (!BADGE_IMAGE_ORIGINS.has(url.origin)) {
            return false;
        }

        if (url.origin === 'https://api.netlify.com') {
            return url.pathname.startsWith('/api/v1/badges/');
        }

        if (url.origin === 'https://d25lcipzij17d.cloudfront.net') {
            return url.pathname.endsWith('/badge.svg');
        }

        return true;
    } catch {
        return false;
    }
}

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
        ? format(new Date(createdIso), PROJECT_DATE_FORMAT)
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
            const imageClassName = isBadgeImageUrl(src)
                ? styles.badgeImage
                : styles.markdownImage;

            return (
                <img
                    alt={alt}
                    className={
                        className
                            ? `${imageClassName} ${className}`
                            : imageClassName
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
