import { Helmet } from '@dr.pogodin/react-helmet';
import ArrowBack from '@mui/icons-material/ArrowBack';
import GitHub from '@mui/icons-material/GitHub';
import React from 'react';
import { Link, useParams } from 'react-router';

import { README_CONTENT } from '../../../utils/githubData';

import styles from './portfolioItem.module.scss';
import PortfolioMarkdown from './PortfolioMarkdown/PortfolioMarkdown';

const PortfolioItemDetails: React.FC = (): React.JSX.Element => {
    const { repo } = useParams<{ repo: string }>();
    if (!repo) {
        return (
            <div className={styles.error}>
                <h3>Error loading repository</h3>
                <p>Repository information is missing</p>
            </div>
        );
    }

    const markdown = README_CONTENT[repo] ?? '';

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
                    href={`https://github.com/tenemo/${repo}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title={`View ${repo} on GitHub`}
                >
                    <GitHub /> github.com/tenemo/{repo}
                </a>
            </div>
            <PortfolioMarkdown markdown={markdown} repo={repo} />
        </main>
    );
};

export default PortfolioItemDetails;
