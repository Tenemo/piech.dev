import type { GithubData } from 'types/github-data';

const data: GithubData = {
    METADATA: { datetimeFetched: '2025-01-01T00:00:00.000Z' },
    REPOSITORY_INFO: {
        'test-project': {
            name: 'test-project',
            description: 'Test description',
        },
        'img-test': { name: 'img-test', description: 'Image test' },
        'video-test': { name: 'video-test', description: 'Video test' },
        'right-test': { name: 'right-test', description: 'Right image test' },
        'custom-repo': { name: 'custom-repo', description: 'Custom repo test' },
        'cached-repo': { name: 'cached-repo', description: 'Cached repo' },
        'link-test': { name: 'link-test', description: 'Link test' },
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
