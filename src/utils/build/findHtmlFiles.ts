import { promises as fs } from 'fs';
import path from 'path';

export async function findHtmlFiles(dir: string): Promise<string[]> {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirents.map(async (dirent) => {
            const resolvedPath = path.resolve(dir, dirent.name);

            if (dirent.isDirectory()) {
                return findHtmlFiles(resolvedPath);
            }

            return resolvedPath.endsWith('.html') ? [resolvedPath] : [];
        }),
    );

    return files.flat();
}
