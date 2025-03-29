import { ArrowBack, GitHub } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router';

import { usePortfolio } from '../PortfolioContext';

import styles from './portfolioItem.module.scss';
import PortfolioMarkdown from './PortfolioMarkdown/PortfolioMarkdown';

const OWNER = 'tenemo';
const BRANCH = 'master';

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

    if (!repo) {
        return (
            <div className={styles.error}>
                <h3>Error</h3>
                <p>Repository name is missing.</p>
            </div>
        );
    }

    return (
        <main className={styles.container}>
            <Helmet>
                <title>{`${repo} | piech.dev`}</title>
            </Helmet>
            <div className={styles.topBar}>
                <Link to="/portfolio">
                    <ArrowBack /> Back to Portfolio
                </Link>
                <a
                    className={styles.githubLink}
                    href={`https://github.com/${OWNER}/${repo}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title={`View ${repo} on GitHub`}
                >
                    <GitHub /> github.com/{OWNER}/{repo}
                </a>
            </div>
            <PortfolioMarkdown markdown={markdown} repo={repo} />
        </main>
    );
};

export default PortfolioItemDetails;
