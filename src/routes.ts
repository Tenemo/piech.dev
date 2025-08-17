import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
    // *? matches everything (including /)
    route('*?', './catchall.tsx'),
] satisfies RouteConfig;
