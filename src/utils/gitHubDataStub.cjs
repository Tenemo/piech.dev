/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */

// Ensures temp/githubData.ts exists before linting/typechecking.
// This avoids CI failures when the file hasn't been generated yet.
// The real file is generated during build (react-router prerender).

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const { buildGithubDataFile } = require('./githubDataCommon.cjs');

async function ensureGithubData() {
    const tempDir = path.join(process.cwd(), 'temp');
    const outPath = path.join(tempDir, 'githubData.ts');
    try {
        await fsp.mkdir(tempDir, { recursive: true });
        if (fs.existsSync(outPath)) {
            const stats = await fsp.stat(outPath);
            if (stats.size > 0) return;
        }

        const stub = buildGithubDataFile({}, {});
        await fsp.writeFile(outPath, stub, 'utf8');

        console.log('Created stub temp/githubData.ts');
    } catch (err) {
        console.warn('Failed to create stub githubData.ts:', err);
    }
}

void ensureGithubData();
