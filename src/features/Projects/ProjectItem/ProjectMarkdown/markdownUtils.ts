import type React from 'react';

export {
    hasUrlScheme,
    getLeadingMarkdownHeading,
    stripRedundantLeadingHeading,
    toRepositoryAssetUrl,
} from '../../../../utils/markdown-content';

export function stringifyCodeChildren(children: React.ReactNode): string {
    if (typeof children === 'string') {
        return children;
    }

    if (!Array.isArray(children)) {
        return '';
    }

    return children
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('');
}
