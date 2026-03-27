export type TopLevelPageContract = {
    route: string;
    navigationLinkName: string;
    title: string;
    heading: string;
    description: string;
};

export type FlagshipProjectContract = {
    route: string;
    cardName: string;
    pageTitle: string;
};

export type ContactLinkContract = {
    label: string;
    href: string;
    opensInNewTab: boolean;
};

export const PRODUCTION_SITE_ORIGIN = 'https://piech.dev';
export const GITHUB_PROFILE_URL = 'https://github.com/Tenemo';
export const FOOTER_REPOSITORY_URL = 'https://github.com/Tenemo/piech.dev';
export const CONTACT_EMAIL_URL = 'mailto:piotr@piech.dev';
export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/ppiech';
export const TELEGRAM_PROFILE_URL = 'https://t.me/tenemo';

export const TOP_LEVEL_PAGES = [
    {
        route: '/',
        navigationLinkName: 'About me',
        title: 'piech.dev',
        heading: 'About me',
        description: "Piotr's personal page.",
    },
    {
        route: '/projects/',
        navigationLinkName: 'Projects',
        title: 'Projects | piech.dev',
        heading: 'Projects',
        description:
            'Projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more.',
    },
    {
        route: '/contact/',
        navigationLinkName: 'Contact',
        title: 'Contact | piech.dev',
        heading: 'Contact',
        description: 'Contact Piotr Piech (email, LinkedIn, GitHub, Telegram).',
    },
] as const satisfies readonly TopLevelPageContract[];

export const HOME_PAGE = TOP_LEVEL_PAGES[0];
export const PROJECTS_PAGE = TOP_LEVEL_PAGES[1];
export const CONTACT_PAGE = TOP_LEVEL_PAGES[2];

export const HOME_CTA_CONTRACTS = [
    {
        linkName: 'Check out my projects',
        destination: PROJECTS_PAGE,
    },
    {
        linkName: 'Contact me',
        destination: CONTACT_PAGE,
    },
] as const;

export const FLAGSHIP_PROJECTS = [
    {
        route: '/projects/piech.dev/',
        cardName: 'piech.dev',
        pageTitle: 'piech.dev | piech.dev',
    },
    {
        route: '/projects/sealed-vote-web/',
        cardName: 'sealed.vote',
        pageTitle: 'sealed.vote | piech.dev',
    },
    {
        route: '/projects/threshold-elgamal/',
        cardName: 'threshold-elgamal',
        pageTitle: 'threshold-elgamal | piech.dev',
    },
] as const satisfies readonly FlagshipProjectContract[];

export const CONTACT_LINK_CONTRACTS = [
    {
        label: 'piotr@piech.dev',
        href: CONTACT_EMAIL_URL,
        opensInNewTab: false,
    },
    {
        label: '/ppiech',
        href: LINKEDIN_PROFILE_URL,
        opensInNewTab: true,
    },
    {
        label: '/Tenemo',
        href: GITHUB_PROFILE_URL,
        opensInNewTab: true,
    },
    {
        label: '@tenemo',
        href: TELEGRAM_PROFILE_URL,
        opensInNewTab: true,
    },
] as const satisfies readonly ContactLinkContract[];

export const toProductionUrl = (route: string): string =>
    new URL(route, `${PRODUCTION_SITE_ORIGIN}/`).toString();
