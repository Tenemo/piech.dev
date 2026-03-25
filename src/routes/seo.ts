import type { BreadcrumbList, Graph, ImageObject } from 'schema-dts';

import { PRODUCTION_OG_IMAGES_DIRECTORY } from 'app/appConstants';
import { SITE_LINKS } from 'app/siteLinks';
import { repositoriesData } from 'utils/data/githubData';
import { getOgImageSize } from 'utils/media/ogImageSizes';

type BreadcrumbItem = {
    name: string;
    path: string;
};

export const getSiteUrl = (path = '/'): string =>
    new URL(path, SITE_LINKS.home).toString();

export const getRepositoryDates = (
    repo = 'piech.dev',
): {
    datePublished: string | undefined;
    dateModified: string | undefined;
} => ({
    datePublished: repositoriesData[repo]?.createdDatetime,
    dateModified: repositoriesData[repo]?.lastCommitDatetime,
});

export const createImageObject = ({
    id,
    imageName,
    alt,
}: {
    id: string;
    imageName: string;
    alt: string;
}): ImageObject => {
    const size = getOgImageSize(imageName);
    const imageUrl = `${PRODUCTION_OG_IMAGES_DIRECTORY}${imageName}`;

    return {
        '@type': 'ImageObject',
        '@id': id,
        contentUrl: imageUrl,
        url: imageUrl,
        width: {
            '@type': 'QuantitativeValue',
            value: size.width,
            unitText: 'px',
        },
        height: {
            '@type': 'QuantitativeValue',
            value: size.height,
            unitText: 'px',
        },
        caption: alt,
    };
};

export const createBreadcrumbList = ({
    id,
    items,
}: {
    id: string;
    items: readonly BreadcrumbItem[];
}): BreadcrumbList => ({
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: getSiteUrl(item.path),
    })),
});

export const createMetaTags = ({
    title,
    description,
    keywords,
    type,
    path,
    imageName,
    imageAlt,
    graph,
    extra = [],
}: {
    title: string;
    description: string;
    keywords: string;
    type: string;
    path: string;
    imageName: string;
    imageAlt: string;
    graph: Graph;
    extra?: readonly Record<string, unknown>[];
}): Record<string, unknown>[] => {
    const size = getOgImageSize(imageName);
    const imageUrl = `${PRODUCTION_OG_IMAGES_DIRECTORY}${imageName}`;
    const pageUrl = getSiteUrl(path);

    return [
        { title },
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: type },
        { property: 'og:url', content: pageUrl },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: String(size.width) },
        { property: 'og:image:height', content: String(size.height) },
        { property: 'og:image:alt', content: imageAlt },
        { tagName: 'link', rel: 'canonical', href: pageUrl },
        ...extra,
        { 'script:ld+json': graph },
    ];
};
