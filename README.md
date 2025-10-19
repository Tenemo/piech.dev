# piech.dev

[piech.dev](https://piech.dev)

[![Netlify Status](https://api.netlify.com/api/v1/badges/4df86a71-2a3f-40f9-9bd5-b6dacd4f420c/deploy-status)](https://app.netlify.com/sites/piech-dev/deploys)

My personal page. Over time it turned into a complex project itself: it supports loading all projects' information directly from GitHub, renders GitHub's markdown, the whole page is pre-rendered and served with zero JS. It also includes dynamic <meta> tags for each project page, including individual og:image tags with sizes. All routes have appropriate JSON-LD objects with relevant information.

<img src="public/media/projects/piech.dev.webp" alt="Lighthouse results" title="Lighthouse results" width="500" />

## Dynamic project list pulled from GitHub-based

- The projects/ page is managed via minimal configuration, just based on repository names. Projects metadata and READMEs are fetched directly from GitHub at build time.
- Markdown rendering transforms relative links to proper URLs and handles videos, so that you can see video previews of my projects without leaving my site.
- GitHub repository topics automatically become \<meta> keywords.
- GitHub information, as well as images are dynamically pulled to each project's \<head> into appropriate og: tags, allowing for custom preview card of each project in social media and on messengers.

## React pre-rendering with zero JavaScript served to the user

- The whole site, including all project routes, is pre-rendered with React Router in framework mode into HTML.
- The site ships without ANY client-side JavaScript despite being built in React.
- For performance reasons, the whole CSS is inlined into HTML, as there is so little of it and it significantly sped up page load times and it eliminates the awful Flash of Unstyled Content no matter the connection speed.
- Images are utilizing Netlify Image CDN to speed up their load times and to avoid serving oversized images.
- Thanks to the above and a ton of other optimizations, all routes, including the heaviest /projects route, score a perfect 100/100/100/100 on [Google Lighthouse](https://pagespeed.web.dev/) mobile, which throttles to a slow 4G network connection.

<img src="public/media/readme/lighthouse.webp" alt="Lighthouse results" title="Lighthouse results" width="500" />

## Post-build scripts

As of 2025, if you want to use React for generating static HTML sites and you don't rely on all-batteries-included frameworks/services, the ecosystem support is quite poor. React-router v7 with its framework mode and pre-rendering support changed the situation for the better. Still, it is assumed you will serve the .html static assets and then hydrate the page with JavaScript. If you want to have a true zero-JS output, you have do some of the wiring yourself. Moreover, most popular NPM packages for inlining CSS inline it into each html element's tags, which doesn't support media queries.

This resulted in the project using the following post-build scripts:

1.

### Why use React at all?

One might ask, if you don't want to bundle any JavaScript, why bother using React at all, just write HTML & CSS or use tools meant for the purpose.

First of all, I want a framework to provide me with a reusable component system and state management logic during the pre-render step and I find React easy to use for this purpose.

There are most likely better libraries/frameworks to do what I'm doing, but the second simple reason why I went with React is that I'm just comfortable with it and I wanted to save time. Did I end up saving time writing all this post-rendering logic and fighting the build tools not to require JS? Probably not, but I embrace the sunk-cost fallacy for my personal site and plan to continue with React :)

Another reason is that I initially intended for the whole page to be hydrated - and I might still start doing that if I need more interactivity - but I realized all that I'm doing can be served without any JavaScript. It's unlikely I'll do it, but it's good to always have that option: with minimal changes to the project, this static-content webpage can be transformed into a client-side React app.

## Development

Notes for myself (Piotr) to follow when making changes to the project. At the time of writing it seems a bit redundant, but there's a nonzero chance that future Piotr will be very grateful.

### Adding a new route

Steps to follow when adding a new route to the app:

1.

### Adding a new project

Steps

1.
