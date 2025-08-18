/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */

// Ensures temp/githubData.json exists before linting/typechecking.
// This avoids CI failures when the file hasn't been generated yet.
// The real file is generated during build (react-router prerender).

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const { buildGithubDataJson } = require('./githubDataCommon.cjs');

async function ensureGithubData() {
    const tempDir = path.join(process.cwd(), 'temp');
    const outPath = path.join(tempDir, 'githubData.json');
    try {
        await fsp.mkdir(tempDir, { recursive: true });
        if (fs.existsSync(outPath)) {
            const stats = await fsp.stat(outPath);
            if (stats.size > 0) return;
        }

        const stub = buildGithubDataJson({}, {});
        await fsp.writeFile(outPath, JSON.stringify(stub, null, 2), 'utf8');

        console.log('Created stub temp/githubData.json');
    } catch (err) {
        console.warn('Failed to create stub githubData.json:', err);
    }
}

void ensureGithubData();
