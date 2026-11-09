import fs from 'node:fs/promises';
import path from 'node:path';

import { PROJECTS } from '../../features/Projects/projectsData.ts';

import { createLlmsFiles } from './llms-content.ts';

async function main(): Promise<void> {
    const outputDirectory = path.resolve('dist/client');
    await fs.access(outputDirectory);
    const cache: unknown = JSON.parse(
        await fs.readFile('temp/githubData.json', 'utf8'),
    );
    const files = createLlmsFiles(PROJECTS, cache);
    for (const [relativePath, content] of files) {
        const outputPath = path.resolve(outputDirectory, relativePath);
        if (!outputPath.startsWith(`${outputDirectory}${path.sep}`))
            throw new Error(`Invalid output path: ${relativePath}`);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, content, 'utf8');
    }
    console.log(
        `Generated llms.txt and ${String(files.size - 1)} project Markdown files.`,
    );
}

main().catch((error: unknown) => {
    console.error('LLM content generation failed:', error);
    process.exitCode = 1;
});
