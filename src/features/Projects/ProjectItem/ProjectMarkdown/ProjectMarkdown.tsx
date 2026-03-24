import { format } from 'date-fns';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// eslint-disable-next-line import/extensions
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus.js';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import styles from './projectMarkdown.module.scss';

import { repositoriesData } from 'utils/githubData';

const OWNER = 'tenemo';
const GITHUB_USER_ATTACHMENT_PATTERN =
    /^https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+$/;

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
        if (url.startsWith('http')) {
            // Don't transform GitHub user-attachment URLs in urlTransform
            // We'll handle them in the component rendering
            if (GITHUB_USER_ATTACHMENT_PATTERN.test(url)) {
                return url;
            }
            return url;
        }

        if (url.startsWith('./') || url.startsWith('../')) {
            url = url.replace(/^\.\//g, '');
        }

        if (key === 'src' && repo) {
            return `https://github.com/${OWNER}/${repo}/blob/${defaultBranch}/${url}?raw=true`;
        }

        if (key === 'href' && !url.startsWith('#') && repo) {
            return `https://github.com/${OWNER}/${repo}/blob/${defaultBranch}/${url}`;
        }

        return url;
    };

    const components: Components = {
        pre({ children }) {
            return <>{children}</>;
        },
        code({ node: _node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '');
            return match ? (
                <SyntaxHighlighter
                    className={styles.codeBlock}
                    language={match[1]}
                    // @ts-expect-error react-syntax-highlighter style typings are inaccurate
                    style={vscDarkPlus}
                    wrapLines={true}
                    wrapLongLines={true}
                    {...props}
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
                    src={src}
                    {...props}
                />
            );
        },
        a({ node: _node, href, children, ...props }) {
            if (href && GITHUB_USER_ATTACHMENT_PATTERN.test(href)) {
                return (
                    <video
                        autoPlay
                        className={styles.videoPlayer}
                        controls
                        loop
                        muted
                        playsInline
                        src={href}
                        title={
                            typeof children === 'string'
                                ? children
                                : 'Video attachment'
                        }
                    />
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
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                urlTransform={urlTransform}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
};

export default ProjectMarkdown;
