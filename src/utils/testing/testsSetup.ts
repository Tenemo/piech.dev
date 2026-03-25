import '@testing-library/jest-dom';
import { vi } from 'vitest';

import { REPOSITORIES as STUB_REPOSITORIES } from 'mocks/mockGithubData';

vi.mock('utils/data/githubData', () => ({
    repositoriesData: STUB_REPOSITORIES,
}));
