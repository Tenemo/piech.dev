export const HOME_PATH = '/';
export const PROJECTS_PATH = '/projects/';
export const CONTACT_PATH = '/contact/';

export const getProjectPath = (repo: string): string => `/projects/${repo}/`;

export const ensureTrailingSlash = (path: string): string => {
    if (path === HOME_PATH) {
        return HOME_PATH;
    }

    return path.endsWith('/') ? path : `${path}/`;
};

export const normalizePathForMatch = (path: string): string => {
    if (path === HOME_PATH) {
        return HOME_PATH;
    }

    return path.endsWith('/') ? path.slice(0, -1) : path;
};
