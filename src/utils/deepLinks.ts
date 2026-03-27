import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

export const MODULE_ROUTE_MAP = {
  home: '/',
  map: '/map',
  maintenance: '/maintenance',
  music: '/music',
  settings: '/settings'
} as const;

export type DeepLinkModule = keyof typeof MODULE_ROUTE_MAP;

export const resolveModulePath = (moduleName?: string | null) => {
  if (!moduleName) return null;
  const key = moduleName.toLowerCase() as DeepLinkModule;
  return MODULE_ROUTE_MAP[key] ?? null;
};

export const normalizeQueryString = (value: unknown) => {
  return typeof value === 'string' ? value : null;
};

export const applyRootDeepLinkRedirect = (route: RouteLocationNormalizedLoaded, router: Router, fallbackModule?: string | null) => {
  const moduleName = normalizeQueryString(route.query.module) ?? fallbackModule ?? null;
  const target = resolveModulePath(moduleName);

  if (!target || target === route.path) return;

  router.replace({
    path: target,
    query: {
      ...route.query,
      module: undefined
    }
  });
};
