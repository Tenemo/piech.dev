import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import styles from './portfolioItemDetails.module.scss';

const OWNER = 'tenemo';

const PortfolioItemDetails = (): React.JSX.Element => {
    const { repo } = useParams();
    const [markdown, setMarkdown] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!repo) {
            setError('Repository information is missing');
            setIsLoading(false);
            return;
        }

        const fetchReadme = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const repoResponse = await fetch(
                    `https://api.github.com/repos/${OWNER}/${repo}`,
                );

                if (!repoResponse.ok) {
                    throw new Error(
                        `Failed to fetch repository information: ${repoResponse.statusText}`,
                    );
                }

                const repoData = await repoResponse.json();
                const defaultBranch = repoData.default_branch;

                const readmeResponse = await fetch(
                    `https://raw.githubusercontent.com/${OWNER}/${repo}/${defaultBranch}/README.md`,
                );

                if (!readmeResponse.ok) {
                    throw new Error(
                        `Failed to fetch README: ${readmeResponse.statusText}`,
                    );
                }

                const readmeContent = await readmeResponse.text();
                setMarkdown(readmeContent);
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

        fetchReadme();
    }, [repo]);

    const urlTransform = (url: string, key: string, node: any): string => {
        if (url.startsWith('http')) {
            return url;
        }

        if (url.startsWith('./') || url.startsWith('../')) {
            url = url.replace(/^\.\//g, '');
        }

        if (key === 'src') {
            return `https://github.com/${OWNER}/${repo}/blob/master/${url}?raw=true`;
        }

        if (key === 'href' && !url.startsWith('#')) {
            return `https://github.com/${OWNER}/${repo}/blob/master/${url}`;
        }

        return url;
    };

    const components = {
        code(props: any) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');

            return (
                <code
                    {...rest}
                    className={match ? styles.codeBlock : styles.inlineCode}
                >
                    {children}
                </code>
            );
        },
        img(props: any) {
            return <img {...props} style={{ maxWidth: '100%' }} />;
        },
        h1(props: any) {
            return <h1 {...props} style={{ color: 'var(--accent-color)' }} />;
        },
        h2(props: any) {
            return <h2 {...props} style={{ color: 'var(--accent-color)' }} />;
        },
        h3(props: any) {
            return <h3 {...props} style={{ color: 'var(--accent-color)' }} />;
        },
        a(props: any) {
            return <a {...props} style={{ color: 'var(--link-color)' }} />;
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
        <div className={styles.container}>
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
        </div>
    );
};

export default PortfolioItemDetails;
