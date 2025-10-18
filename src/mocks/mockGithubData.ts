import type { GithubData } from 'types/github-data';

const baseInfo = {
    lastCommitDatetime: '2025-01-02T00:00:00.000Z',
    readme_content: '# Placeholder',
};

const data: GithubData = {
    metadata: { fetchedDatetime: '2025-01-01T00:00:00.000Z' },
    repositories: {
        'test-project': {
            name: 'test-project',
            description: 'Test description',
            topics: ['react', 'typescript'],
            createdDatetime: '2020-05-01T12:00:00.000Z',
            ...baseInfo,
        },
        'img-test': {
            name: 'img-test',
            description: 'Image test',
            topics: ['images'],
            createdDatetime: '2023-09-12T08:00:00.000Z',
            ...baseInfo,
        },
        'video-test': {
            name: 'video-test',
            description: 'Video test',
            topics: ['video'],
            createdDatetime: '2022-01-20T15:30:00.000Z',
            ...baseInfo,
        },
        'right-test': {
            name: 'right-test',
            description: 'Right image test',
            topics: ['ui'],
            createdDatetime: '2018-07-15T00:00:00.000Z',
            ...baseInfo,
        },
        'custom-repo': {
            name: 'custom-repo',
            description: 'Custom repo test',
            createdDatetime: '2022-03-05T08:15:00.000Z',
            ...baseInfo,
        },
        'cached-repo': {
            name: 'cached-repo',
            description: 'Cached repo',
            topics: [],
            createdDatetime: '2017-01-01T00:00:00.000Z',
            ...baseInfo,
        },
        'link-test': {
            name: 'link-test',
            description: 'Link test',
            createdDatetime: '2018-07-07T07:07:07.000Z',
            ...baseInfo,
        },
        'epoch-test': {
            name: 'epoch-test',
            description: 'Epoch fallback',
            createdDatetime: '1970-01-01T00:00:00.000Z',
            ...baseInfo,
        },
        'test-repo': {
            name: 'test-repo',
            description: 'Test Readme Content',
            createdDatetime: '2020-01-01T00:00:00.000Z',
            ...baseInfo,
            readme_content: '# Test Readme Content',
        },
        'cached-project': {
            name: 'cached-project',
            description: 'Cached Readme Content',
            createdDatetime: '2020-01-01T00:00:00.000Z',
            ...baseInfo,
            readme_content: '# Cached Readme Content',
        },
        'new-content-project': {
            name: 'new-content-project',
            description: 'New Readme Content',
            createdDatetime: '2020-01-01T00:00:00.000Z',
            ...baseInfo,
            readme_content: '# New Readme Content',
        },
    },
};

export const REPOSITORIES = data.repositories;
export const METADATA = data.metadata;
export default data;
