import '@testing-library/jest-dom';
import { vi } from 'vitest';

import {
    REPOSITORIES as STUB_REPOSITORIES,
    METADATA as STUB_METADATA,
} from 'mocks/mockGithubData';

vi.mock('utils/githubData', () => ({
    repositoriesData: STUB_REPOSITORIES,
    metadata: STUB_METADATA,
}));
