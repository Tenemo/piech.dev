# piech.dev

[piech.dev](https://piech.dev)

[![Netlify Status](https://api.netlify.com/api/v1/badges/4df86a71-2a3f-40f9-9bd5-b6dacd4f420c/deploy-status)](https://app.netlify.com/sites/piech-dev/deploys)

My personal page, [visit it](https://piech.dev) to find out more.

## How it works - dynamic, GitHub-based portfolio

- Projects are defined in `src/features/Portfolio/projects.ts` (name, optional `repoName`, technologies, and a local preview image/video).
- During build or locally, `src/utils/fetchGitHubData.ts` fetches metadata and READMEs for those repos from GitHub and writes `temp/githubData.json`.
- At runtime, `src/utils/githubData.ts` imports that JSON and exposes:
    - `REPOSITORY_INFO[repo]` → repo name/description for cards
    - `README_CONTENT[repo]` → raw markdown for details view
- The portfolio list (`Portfolio.tsx` → `PortfolioCard`) [shows each project with its preview and GitHub description](https://piech.dev/portfolio/).
- The project details page (`PortfolioItem.tsx`) [renders the repo README](https://piech.dev/portfolio/bob) using `PortfolioMarkdown`, transforming relative links and embedding media.
