/**
 * @coloco/router - A routing library for Coloco applications
 */

import type { Route } from "@mateothegreat/svelte5-router/index";
import type { Component, Snippet } from "svelte";

function getRoutesFromModules(modules: Record<string, any>) {
  const routes = [];
  for (let [path, module] of Object.entries(modules)) {
    // Dev only paths
    if (path.includes('-')) {
      // @ts-ignore
      if (import.meta.env.DEV) {
        path = path.replace('-', '');
      } else {
        continue;
      }
    }

    const uri = "^/" + path
      .replace(/^(..\/)+/, '')
      .replace(/^\.\.\/(.+)$/, '$1')
      .replace(/^(.+)\/index\.svelte$/, '$1')
      .replace(/^(.+)\.svelte$/, '$1') + "$";
    routes.push({ path: uri, component: module.default });
  }
  return routes;
}

function getRoutes({
  index,
  notFound
}: {
  index: Component<any> | Snippet,
  notFound: Component<any> | Snippet
}): Route[] {
  // path join
  // @ts-ignore
  const modules: Record<string, any> = import.meta.glob(
    [`/../**/*.svelte`, "!/../node_modules/**/*.svelte", "!/../+**/*.svelte"],
    { eager: true },
  );
  return [
    {
      path: "^/$",
      component: index,
    },
    ...getRoutesFromModules(modules),
    {
      path: ".+",
      component: notFound,
    },
  ];
}

export { route, Router, type Route } from "@mateothegreat/svelte5-router/index";
export { getRoutes }; 