import type { TechnologyName } from './technologies';

export type ProjectPreviewAsset = {
    fileName: string;
    width: number;
    height: number;
};

export type ProjectDefinition = {
    name: string;
    repo: string;
    projectPreview: ProjectPreviewAsset;
    ogImage: string;
    ogImageAlt: string;
    programmingLanguage: string;
    technologies: readonly TechnologyName[];
};

export const PROJECTS = [
    {
        name: 'threshold-elgamal',
        repo: 'threshold-elgamal',
        projectPreview: {
            fileName: 'threshold-elgamal.webp',
            width: 1196,
            height: 683,
        },
        ogImage: 'threshold-elgamal_preview.jpg',
        ogImageAlt:
            'npm package page for threshold-elgamal with the Readme header, install command and repository links.',
        programmingLanguage: 'TypeScript',
        technologies: ['typescript', 'npm', 'typedoc'],
    },
    {
        name: 'sealed.vote',
        repo: 'sealed-vote',
        projectPreview: {
            fileName: 'sealed.vote.mp4',
            width: 2542,
            height: 1264,
        },
        ogImage: 'sealed.vote_preview.jpg',
        ogImageAlt:
            'sealed.vote ranked-choice voting UI with 1-10 rating buttons and a panel indicating the poll is waiting to be closed.',
        programmingLanguage: 'TypeScript',
        technologies: [
            'typescript',
            'fastify',
            'postgresql',
            'docker',
            'react',
            'redux',
            'mui',
            'netlify',
            'sentry',
        ],
    },
    {
        name: 'bob',
        repo: 'bob',
        projectPreview: {
            fileName: 'bob-demo-movement.mp4',
            width: 1280,
            height: 720,
        },
        ogImage: 'bob_preview.jpg',
        ogImageAlt:
            'Close-up photo of the bob hexapod breadboard-on-legs robot with ESP32-S3 board, OV2640 camera module and SG90 servos.',
        programmingLanguage: 'C++',
        technologies: [
            'cpp',
            'platformio',
            'openai',
            'esp32',
            'esp32-s3',
            'typescript',
            'react',
        ],
    },
    {
        name: 'reactplate',
        repo: 'reactplate',
        projectPreview: {
            fileName: 'reactplate_lighthouse.webp',
            width: 1353,
            height: 882,
        },
        ogImage: 'reactplate_preview.jpg',
        ogImageAlt:
            'Reactplate demo and a Chrome Lighthouse audit scoring 100/100/100/100.',
        programmingLanguage: 'TypeScript',
        technologies: [
            'typescript',
            'react',
            'redux',
            'sass',
            'vitejs',
            'eslint',
            'prettier',
            'netlify',
            'sentry',
        ],
    },
    {
        name: 'piech.dev',
        repo: 'piech.dev',
        projectPreview: {
            fileName: 'piech.dev.webp',
            width: 1235,
            height: 990,
        },
        ogImage: 'piech.dev_projects.jpg',
        ogImageAlt:
            'Screenshot of the piech.dev Projects page with project cards.',
        programmingLanguage: 'TypeScript',
        technologies: [
            'typescript',
            'react',
            'sass',
            'vitejs',
            'eslint',
            'prettier',
            'netlify',
        ],
    },
    {
        name: 'expressplate',
        repo: 'expressplate',
        projectPreview: {
            fileName: 'expressplate.webp',
            width: 682,
            height: 290,
        },
        ogImage: 'expressplate_preview.jpg',
        ogImageAlt:
            'Terminal screenshot running expressplate in development with nodemon and tsx.',
        programmingLanguage: 'TypeScript',
        technologies: [
            'typescript',
            'nodejs',
            'express',
            'vitejs',
            'eslint',
            'prettier',
            'sentry',
        ],
    },
    {
        name: 'aliases.sh',
        repo: 'aliases.sh',
        projectPreview: {
            fileName: 'aliases.sh.webp',
            width: 833,
            height: 622,
        },
        ogImage: 'aliases.sh_preview.jpg',
        ogImageAlt:
            'Screenshot of aliases.sh showing bash aliases for npm and git, with sections for packages and git checkout commands.',
        programmingLanguage: 'Bash',
        technologies: ['bash'],
    },
    {
        name: 'tiles.town',
        repo: 'tiles-town',
        projectPreview: {
            fileName: 'tiles-town_full-game_dark-mode.mp4',
            width: 1274,
            height: 716,
        },
        ogImage: 'tiles.town_preview.jpg',
        ogImageAlt:
            'Tiles.town puzzle game board with orange and gray squares, controls on the right and a high-scores table.',
        programmingLanguage: 'TypeScript',
        technologies: [
            'typescript',
            'express',
            'postgresql',
            'react',
            'redux',
            'netlify',
            'sentry',
        ],
    },
    {
        name: 'particle.golf',
        repo: 'particle-golf',
        projectPreview: {
            fileName: 'particle-golf_demo.mp4',
            width: 1442,
            height: 720,
        },
        ogImage: 'particle-golf_preview.jpg',
        ogImageAlt:
            'particle.golf web app showing multi-colored parametric particle trajectories with a control panel listing particles and equations.',
        programmingLanguage: 'TypeScript',
        technologies: [
            'typescript',
            'react',
            'sentry',
            'threejs',
            'webgl',
            'mathjs',
        ],
    },
] as const satisfies readonly ProjectDefinition[];
