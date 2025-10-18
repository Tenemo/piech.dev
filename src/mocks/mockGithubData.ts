import type { GithubData } from 'types/githubData';

const data: GithubData = {
    metadata: { fetchedDatetime: '2025-01-01T00:00:00.000Z' },
    repositories: {
        'test-repo': {
            name: 'test-repo',
            description: 'Test Readme Content',
            createdDatetime: '2020-01-01T00:00:00.000Z',
            lastCommitDatetime: '2025-01-02T00:00:00.000Z',
            readme_content: '# Test Readme Content',
        },
        'cached-project': {
            name: 'cached-project',
            description: 'Cached Readme Content',
            createdDatetime: '2020-01-01T00:00:00.000Z',
            lastCommitDatetime: '2025-01-02T00:00:00.000Z',
            readme_content: '# Cached Readme Content',
        },
        'img-test': {
            name: 'img-test',
            description: 'Image test',
            createdDatetime: '2023-09-12T08:00:00.000Z',
            lastCommitDatetime: '2025-01-02T00:00:00.000Z',
            readme_content: '# Placeholder',
            topics: ['images'],
        },
        'video-test': {
            name: 'video-test',
            description: 'Video test',
            createdDatetime: '2022-01-20T15:30:00.000Z',
            lastCommitDatetime: '2025-01-02T00:00:00.000Z',
            readme_content: '# Placeholder',
        },
        'right-test': {
            name: 'right-test',
            description: 'Right image test',
            createdDatetime: '2024-06-01T00:00:00.000Z',
            lastCommitDatetime: '2025-01-02T00:00:00.000Z',
            readme_content: '# Placeholder',
        },
        'link-test': {
            name: 'link-test',
            description: 'Link test',
            createdDatetime: '2018-07-07T07:07:07.000Z',
            lastCommitDatetime: '2025-01-02T00:00:00.000Z',
            readme_content: '# Placeholder',
        },
        'epoch-test': {
            name: 'epoch-test',
            description: 'Epoch fallback',
            createdDatetime: '1970-01-01T00:00:00.000Z',
            lastCommitDatetime: '2025-01-02T00:00:00.000Z',
            readme_content: '# Placeholder',
        },
        'new-content-project': {
            name: 'new-content-project',
            description: 'New Readme Content',
            createdDatetime: '2020-01-01T00:00:00.000Z',
            lastCommitDatetime: '2025-01-02T00:00:00.000Z',
            readme_content: '# New Readme Content',
        },
    },
};

export const REPOSITORIES = data.repositories;
export const METADATA = data.metadata;
export default data;
