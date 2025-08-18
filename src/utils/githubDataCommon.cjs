/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Build the contents of temp/githubData.ts given repository info and README maps.
// Common helper used by both the pre-lint stub and the build-time generator.

/**
 * @param {Record<string, {name: string, description: string}>} infoObject
 * @param {Record<string, string>} readmeObject
 */
function buildGithubDataFile(infoObject = {}, readmeObject = {}) {
    const header =
        `// AUTO-GENERATED at build time. Do not edit by hand.\n` +
        `// Source: react-router.config.ts -> generateGithubData()\n` +
        `export type RepositoryInfo = { name: string; description: string };\n`;

    const infoExport = `export const REPOSITORY_INFO: Partial<Record<string, RepositoryInfo>> = ${JSON.stringify(
        infoObject,
        null,
        2,
    )} as Partial<Record<string, RepositoryInfo>>;\n`;

    const readmeExport = `export const README_CONTENT: Partial<Record<string, string>> = ${JSON.stringify(
        readmeObject,
        null,
        2,
    )} as Partial<Record<string, string>>;\n`;

    return header + infoExport + readmeExport;
}

module.exports = { buildGithubDataFile };
