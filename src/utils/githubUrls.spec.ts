import { describe, expect, it } from 'vitest';

import { isGithubUserAttachmentUrl } from './githubUrls';

describe('githubUrls', () => {
    it('detects GitHub user attachment URLs with explicit https', () => {
        expect(
            isGithubUserAttachmentUrl(
                'https://github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc',
            ),
        ).toBe(true);
    });

    it('detects protocol-relative GitHub user attachment URLs', () => {
        expect(
            isGithubUserAttachmentUrl(
                '//github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc',
            ),
        ).toBe(true);
    });

    it('rejects non-attachment or insecure URLs', () => {
        expect(
            isGithubUserAttachmentUrl(
                'https://github.com/Tenemo/piech.dev/blob/main/README.md',
            ),
        ).toBe(false);
        expect(
            isGithubUserAttachmentUrl(
                'http://github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc',
            ),
        ).toBe(false);
    });
});
