import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
    route('/', './app/App.tsx', [
        route('', './routes/index.tsx'),
        route('projects', './routes/projects.tsx'),
        route('projects/:repo', './routes/project-item.tsx'),
        route('contact', './routes/contact.tsx'),
        route('*', './routes/catchall.tsx'),
    ]),
] satisfies RouteConfig;
