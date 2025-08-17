import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// eslint-disable-next-line import/extensions
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus.js';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import styles from './portfolioMarkdown.module.scss';

const OWNER = 'tenemo';
const BRANCH = 'master';
const GITHUB_USER_ATTACHMENT_PATTERN =
    /^https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+$/;

type PortfolioMarkdownProps = {
    markdown: string;
    repo: string;
};

const PortfolioMarkdown = ({
    markdown,
    repo,
}: PortfolioMarkdownProps): React.JSX.Element => {
    const urlTransform = (url: string, key: string, _node: unknown): string => {
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
            return `https://github.com/${OWNER}/${repo}/blob/${BRANCH}/${url}?raw=true`;
        }

        if (key === 'href' && !url.startsWith('#') && repo) {
            return `https://github.com/${OWNER}/${repo}/blob/${BRANCH}/${url}`;
        }

        return url;
    };

    const components: Components = {
        code({ className, children, ...props }) {
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
        img({ src, alt, ...props }) {
            return (
                <img
                    alt={alt}
                    src={src}
                    {...props}
                    style={{ maxWidth: '100%' }}
                />
            );
        },
        a({ href, children, ...props }) {
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
                <a
                    href={href}
                    {...props}
                    style={{ color: 'var(--link-color)' }}
                >
                    {children}
                </a>
            );
        },
        h1({ children, ...props }) {
            return (
                <h1 {...props} style={{ color: 'var(--accent-color)' }}>
                    {children}
                </h1>
            );
        },
        h2({ children, ...props }) {
            return (
                <h2 {...props} style={{ color: 'var(--accent-color)' }}>
                    {children}
                </h2>
            );
        },
        h3({ children, ...props }) {
            return (
                <h3 {...props} style={{ color: 'var(--accent-color)' }}>
                    {children}
                </h3>
            );
        },
    };

    return (
        <div className={styles.markdownContainer}>
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

export default PortfolioMarkdown;
