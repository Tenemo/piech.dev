import { TECHNOLOGIES } from './technologies';

export const PROJECTS: {
    projectPreview: string;
    project: string;
    repoName?: string;
    seoImage: string;
    technologies: (keyof typeof TECHNOLOGIES)[];
}[] = [
    {
        project: 'threshold-elgamal',
        projectPreview: 'threshold-elgamal.webp',
        seoImage: 'threshold-elgamal_preview.jpg',
        technologies: ['typescript', 'npm', 'typedoc'],
    },
    {
        project: 'sealed.vote',
        repoName: 'sealed-vote-web',
        projectPreview: 'sealed.vote.mp4',
        seoImage: 'sealed.vote_preview.jpg',
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
        seoImage: 'bob_preview.jpg',
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
        seoImage: 'reactplate_preview.jpg',
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
        project: 'expressplate',
        projectPreview: 'expressplate.webp',
        seoImage: 'expressplate_preview.jpg',
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
        seoImage: 'aliases.sh_preview.jpg',
        technologies: ['bash'],
    },
    {
        project: 'tiles.town',
        repoName: 'tiles-town',
        projectPreview: 'tiles-town_full-game_dark-mode.mp4',
        seoImage: 'tiles.town_preview.jpg',
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
        seoImage: 'particle-golf_preview.jpg',
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
];
