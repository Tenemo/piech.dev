import type { GithubData } from './github-data';

declare module '../../temp/githubData.json' {
    const value: GithubData;
    export default value;
}
