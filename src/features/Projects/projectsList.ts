import { TECHNOLOGIES } from './technologies';

export const PROJECTS: {
    projectPreview: string;
    project: string;
    repoName?: string;
    ogImage: string;
    ogImageAlt: string;
    technologies: (keyof typeof TECHNOLOGIES)[];
}[] = [
    {
        project: 'threshold-elgamal',
        projectPreview: 'threshold-elgamal.webp',
        ogImage: 'threshold-elgamal_preview.jpg',
        ogImageAlt:
            'npm package page for threshold-elgamal with the Readme header, install command and repository links.',
        technologies: ['typescript', 'npm', 'typedoc'],
    },
    {
        project: 'sealed.vote',
        repoName: 'sealed-vote-web',
        projectPreview: 'sealed.vote.mp4',
        ogImage: 'sealed.vote_preview.jpg',
        ogImageAlt:
            'sealed.vote ranked-choice voting UI with 1-10 rating buttons and a panel indicating the poll is waiting to be closed.',
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
        project: 'bob',
        projectPreview: 'bob-demo-movement.mp4',
        ogImage: 'bob_preview.jpg',
        ogImageAlt:
            'Close-up photo of the bob hexapod breadboard-on-legs robot with ESP32-S3 board, OV2640 camera module and SG90 servos.',
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
        project: 'reactplate',
        projectPreview: 'reactplate_lighthouse.webp',
        ogImage: 'reactplate_preview.jpg',
        ogImageAlt:
            'Reactplate demo and a Chrome Lighthouse audit scoring 100/100/100/100.',
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
    // {
    //     project: 'piech.dev',
    //     projectPreview: 'piech.dev.webp',
    //     ogImage: 'piech.dev_preview.jpg',
    //     ogImageAlt:
    //         'Screenshot of the piech.dev Projects page with project cards.',
    //     technologies: [
    //         'typescript',
    //         'react',
    //         'sass',
    //         'vitejs',
    //         'eslint',
    //         'prettier',
    //         'netlify',
    //     ],
    // },
    {
        project: 'expressplate',
        projectPreview: 'expressplate.webp',
        ogImage: 'expressplate_preview.jpg',
        ogImageAlt:
            'Terminal screenshot running expressplate in development with nodemon and tsx.',
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
        project: 'aliases.sh',
        projectPreview: 'aliases.sh.webp',
        ogImage: 'aliases.sh_preview.jpg',
        ogImageAlt:
            'Screenshot of aliases.sh showing bash aliases for npm and git, with sections for packages and git checkout commands.',
        technologies: ['bash'],
    },
    {
        project: 'tiles.town',
        repoName: 'tiles-town',
        projectPreview: 'tiles-town_full-game_dark-mode.mp4',
        ogImage: 'tiles.town_preview.jpg',
        ogImageAlt:
            'Tiles.town puzzle game board with orange and gray squares, controls on the right and a high-scores table.',
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
        project: 'particle.golf',
        repoName: 'particle-golf',
        projectPreview: 'particle-golf_demo.mp4',
        ogImage: 'particle-golf_preview.jpg',
        ogImageAlt:
            'particle.golf web app showing multi-colored parametric particle trajectories with a control panel listing particles and equations.',
        technologies: [
            'typescript',
            'react',
            'sentry',
            'threejs',
            'webgl',
            'mathjs',
        ],
    },
    // Probably not worth showing, both mods should be in one repo then, too
    // {
    //     project: 'stellaris_mods',
    //     repoName: 'stellaris-mod-slow-play',
    //     projectPreview: 'YYYYYYYYYY',
    //     technologies: [],
    // },
] as const;
