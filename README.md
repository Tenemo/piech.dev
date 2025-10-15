# piech.dev

[piech.dev](https://piech.dev)

[![Netlify Status](https://api.netlify.com/api/v1/badges/4df86a71-2a3f-40f9-9bd5-b6dacd4f420c/deploy-status)](https://app.netlify.com/sites/piech-dev/deploys)

My personal page, [visit it](https://piech.dev) to find out more.

## How it works - dynamic, GitHub-based projects

- Projects are defined in `src/features/Projects/projectsList.ts` (name, optional `repoName`, technologies, and a local preview image/video).
- During build or locally, `src/utils/fetchGitHubData.ts` fetches metadata and READMEs for those repos from GitHub and writes `temp/gitHubData.json`.
- At runtime, `src/utils/githubData.ts` imports that JSON and exposes:
    - `REPOSITORY_INFO[repo]` → repo name/description for cards
    - `README_CONTENT[repo]` → raw markdown for details view
- The projects list (`Project.tsx` → `ProjectCard`) shows each project with its preview and GitHub description at https://piech.dev/projects/.
- The project details page (`ProjectItem.tsx`) renders the repo README at https://piech.dev/projects/:repo using `ProjectMarkdown`, transforming relative links and embedding media.

## React pre-rendering with zero JavaScript served

- The whole site, including all project routes, is pre-rendered with React Router in framework mode into HTML.
- The site ships without ANY client-side JavaScript despite being built in React.
- Thanks to the above (and a ton of other optimizations), the heaviest route (/projects) scores perfect 100/100/100/100 on [pagespeed.web.dev](https://pagespeed.web.dev/) mobile (which throttles to slow 4G)
