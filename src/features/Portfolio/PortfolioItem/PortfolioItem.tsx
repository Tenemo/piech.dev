import { ArrowBack, GitHub } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Link, useParams } from 'react-router';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { usePortfolio } from '../PortfolioContext';

import styles from './portfolioItem.module.scss';

const OWNER = 'tenemo';
const BRANCH = 'master';
const GITHUB_USER_ATTACHMENT_PATTERN =
    /^https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+$/;

const PortfolioItemDetails = (): React.JSX.Element => {
    const { repo } = useParams<{ repo: string }>();
    const [markdown, setMarkdown] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { getReadmeContent, setReadmeContent } = usePortfolio();

    useEffect(() => {
        if (!repo) {
            setError('Repository information is missing');
            setIsLoading(false);
            return;
        }

        const cachedReadme = getReadmeContent(repo);

        if (cachedReadme) {
            setMarkdown(cachedReadme);
            setIsLoading(false);
            return;
        }

        const fetchReadme = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                const readmeResponse = await fetch(
                    `https://raw.githubusercontent.com/${OWNER}/${repo}/${BRANCH}/README.md`,
                );

                if (!readmeResponse.ok) {
                    throw new Error(
                        `Failed to fetch README: ${readmeResponse.statusText}`,
                    );
                }

                const readmeContent = await readmeResponse.text();
                setMarkdown(readmeContent);
                setReadmeContent(repo, readmeContent);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred',
                );
            } finally {
                setIsLoading(false);
            }
        };

        void fetchReadme();
    }, [repo, getReadmeContent, setReadmeContent]);

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
                    // @ts-expect-error broken @type/ typings
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
            if (src && GITHUB_USER_ATTACHMENT_PATTERN.test(src)) {
                return (
                    <video
                        autoPlay
                        className={styles.videoPlayer}
                        controls
                        loop
                        muted
                        playsInline
                        src={src}
                        title={alt ?? 'Video attachment'}
                    />
                );
            }
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
                    <div className={styles.videoContainer}>
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
                    </div>
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

    if (isLoading) {
        return (
            <div className={styles.loading}>
                Loading repository information...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h3>Error loading repository</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.topBar}>
                <Link to="/portfolio">
                    <ArrowBack /> Back to Portfolio
                </Link>
                {repo && (
                    <a
                        className={styles.githubLink}
                        href={`https://github.com/${OWNER}/${repo}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        title={`View ${repo} on GitHub`}
                    >
                        <GitHub /> github.com/{OWNER}/{repo}
                    </a>
                )}
            </div>
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
        </main>
    );
};

export default PortfolioItemDetails;
