const normalizeUrlForParsing = (url: string): string =>
    url.startsWith('//') ? `https:${url}` : url;

export function isGithubUserAttachmentUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(normalizeUrlForParsing(url));

        return (
            parsedUrl.protocol === 'https:' &&
            parsedUrl.hostname === 'github.com' &&
            parsedUrl.pathname.startsWith('/user-attachments/assets/')
        );
    } catch {
        return false;
    }
}
