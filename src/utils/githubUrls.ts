export function isGithubUserAttachmentUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);

        return (
            parsedUrl.protocol === 'https:' &&
            parsedUrl.hostname === 'github.com' &&
            parsedUrl.pathname.startsWith('/user-attachments/assets/')
        );
    } catch {
        return false;
    }
}
