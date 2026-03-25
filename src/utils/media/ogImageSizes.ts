import { OG_IMAGE_SIZES } from './ogImageSizes.generated';

type ImageSize = { width: number; height: number };

export function getOgImageSize(imageName: string): ImageSize {
    const imageSize = OG_IMAGE_SIZES[imageName];
    if (!imageSize) {
        throw new Error(`Could not determine OG image size for "${imageName}"`);
    }

    return imageSize;
}
