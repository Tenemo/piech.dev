import type { GithubData } from './github-data';

declare module '../../temp/gitHubData.json' {
    const value: GithubData;
    export default value;
}
