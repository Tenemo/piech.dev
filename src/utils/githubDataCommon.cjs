/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * @param {Record<string, {name: string, description: string}>} infoObject
 * @param {Record<string, string>} readmeObject
 */
function buildGithubDataJson(infoObject = {}, readmeObject = {}) {
    return {
        REPOSITORY_INFO: infoObject,
        README_CONTENT: readmeObject,
    };
}

module.exports = { buildGithubDataJson };
