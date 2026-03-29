import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('Netlify functions layout', () => {
    it('keeps only deployable function filenames in the functions directory', () => {
        const functionsDirectory = resolve(process.cwd(), 'netlify/functions');
        const invalidEntries = readdirSync(functionsDirectory, {
            withFileTypes: true,
        })
            .filter((entry) => entry.isFile())
            .map((entry) => entry.name)
            .filter(
                (fileName) =>
                    !/^[A-Za-z0-9_-]+\.(?:[cm]?js|ts)$/.test(fileName),
            );

        expect(invalidEntries).toEqual([]);
    });
});
