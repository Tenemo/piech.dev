export const GITHUB_OWNER = 'Tenemo';

const GITHUB_BASE_URL = `https://github.com/${GITHUB_OWNER}`;

export const SITE_LINKS = {
    home: 'https://piech.dev/',
    emailAddress: 'piotr@piech.dev',
    email: 'mailto:piotr@piech.dev',
    githubProfile: GITHUB_BASE_URL,
    githubRepo: `${GITHUB_BASE_URL}/piech.dev`,
    linkedin: 'https://www.linkedin.com/in/ppiech',
    telegram: 'https://t.me/tenemo',
} as const;
