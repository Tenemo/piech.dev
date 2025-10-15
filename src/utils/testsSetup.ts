import '@testing-library/jest-dom';
import { vi } from 'vitest';

import {
    REPOSITORY_INFO as STUB_REPOSITORY_INFO,
    README_CONTENT as STUB_README_CONTENT,
} from 'mocks/mockGitHubData';

vi.mock('utils/githubData', () => ({
    REPOSITORY_INFO: STUB_REPOSITORY_INFO,
    README_CONTENT: STUB_README_CONTENT,
}));
