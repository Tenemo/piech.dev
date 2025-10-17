import type { GithubData } from 'types/github-data';

const data: GithubData = {
    METADATA: { fetchedDatetime: '2025-01-01T00:00:00.000Z' },
    REPOSITORY_INFO: {
        'test-project': {
            name: 'test-project',
            description: 'Test description',
            topics: ['react', 'typescript'],
            createdDatetime: '2020-05-01T12:00:00.000Z',
        },
        'img-test': {
            name: 'img-test',
            description: 'Image test',
            topics: ['images'],
            createdDatetime: '2021-02-10T09:30:00.000Z',
        },
        'video-test': {
            name: 'video-test',
            description: 'Video test',
            topics: ['video'],
            createdDatetime: '2019-11-20T18:45:00.000Z',
        },
        'right-test': {
            name: 'right-test',
            description: 'Right image test',
            topics: ['ui'],
            createdDatetime: '2018-07-15T00:00:00.000Z',
        },
        'custom-repo': {
            name: 'custom-repo',
            description: 'Custom repo test',
            createdDatetime: '2022-03-05T08:15:00.000Z',
        },
        'cached-repo': {
            name: 'cached-repo',
            description: 'Cached repo',
            topics: [],
            createdDatetime: '2017-01-01T00:00:00.000Z',
        },
        'link-test': {
            name: 'link-test',
            description: 'Link test',
            createdDatetime: '2016-12-12T12:12:12.000Z',
        },
    },
    README_CONTENT: {
        'test-repo': '# Test Readme Content',
        'cached-project': '# Cached Readme Content',
        'new-content-project': '# New Readme Content',
    },
};

export const REPOSITORY_INFO = data.REPOSITORY_INFO;
export const README_CONTENT = data.README_CONTENT;
export default data;
