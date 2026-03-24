import type { ImageSize } from './getImageSize';

const ogImageSizes: Partial<Record<string, ImageSize>> = {
    'aliases.sh_preview.jpg': { width: 833, height: 622 },
    'bob_preview.jpg': { width: 1542, height: 720 },
    'expressplate_preview.jpg': { width: 682, height: 290 },
    'particle-golf_preview.jpg': { width: 1442, height: 720 },
    'piech.dev_contact.jpg': { width: 1031, height: 412 },
    'piech.dev_projects.jpg': { width: 1235, height: 1279 },
    'piotr.jpg': { width: 1063, height: 1535 },
    'reactplate_preview.jpg': { width: 1353, height: 882 },
    'sealed.vote_preview.jpg': { width: 1630, height: 810 },
    'threshold-elgamal_preview.jpg': { width: 1196, height: 683 },
    'tiles.town_preview.jpg': { width: 1274, height: 716 },
};

export function getOgImageSize(imageName: string): ImageSize {
    const imageSize = ogImageSizes[imageName];
    if (imageSize) {
        return imageSize;
    }

    throw new Error(`Missing OG image size for "${imageName}"`);
}
