import { format } from 'date-fns';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// eslint-disable-next-line import/extensions
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus.js';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, {
    defaultSchema,
    type Options as RehypeSanitizeSchema,
} from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import styles from './projectMarkdown.module.scss';

import { SILENT_CAPTIONS_TRACK_PATH } from 'app/appConstants';
import { repositoriesData } from 'utils/data/githubData';

const OWNER = 'tenemo';
const GITHUB_USER_ATTACHMENT_PATTERN =
    /^https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+$/;
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
                    {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
                    {String(children).replace(/\n$/, '')}
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
            <ReactMarkdown
                components={components}
                rehypePlugins={[
                    rehypeRaw,
                    [rehypeSanitize, sanitizedMarkdownSchema],
                ]}
                remarkPlugins={[remarkGfm]}
                urlTransform={urlTransform}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
};

export default ProjectMarkdown;
