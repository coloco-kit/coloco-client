/**
 * @coloco/router - A routing library for Coloco applications
 */

// @ts-ignore
import type { RouteConfig } from "@mateothegreat/svelte5-router";

function getRoutesFromModules(modules: Record<string, any>) {
  const routes = [];
  for (let [path, module] of Object.entries(modules)) {
    // Dev only paths
    if (path.includes('/-')) {
      // @ts-ignore
      if (import.meta.env.DEV) {
        path = path.replace('/-', '/');
      } else {
        continue;
      }
    }

    const uri = new RegExp("^/" + path
      .replace(/^(..\/)+/, '')
      .replace(/^\.\.\/(.+)$/, '$1')
      .replace(/^(.+)\/index\.svelte$/, '$1')
      .replace(/^(.+)\.svelte$/, '$1') + "$");
    routes.push({ path: uri, component: module.default });
  }
  return routes;
}

type PathType = string | number | RegExp | Function | Promise<unknown>;
function getRoutes({
  index,
  notFound
}: {
  index: PathType,
  notFound: PathType
}): RouteConfig[] {
  // path join
  // @ts-ignore
  const modules: Record<string, any> = import.meta.glob(
    [
      "/../**/*.svelte", 
      "!/../node_modules/**/*.svelte",
      "!/../+**/*.svelte", 
      "!./**/*.svelte", 
      "!/**/*.svelte"
    ],
    { eager: true },
  );
  return [
    {
      path: /.+/,
      component: notFound,
    },
    {
      name: "Index",
      component: index,
    },
    ...getRoutesFromModules(modules),
  ];
}
export function queryString<T>(key: string, defaultValue: T = null as T): string | T {
  const result = new URLSearchParams(window.location.search).get(key);
  return result === null ? defaultValue : result;
};

// @ts-ignore
export { goto, Query, route, Router, type Route, type RouteResult } from "@mateothegreat/svelte5-router";
export { getRoutes }; 