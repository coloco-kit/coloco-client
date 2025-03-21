/**
 * @coloco/router - A routing library for Coloco applications
 */

// @ts-ignore
import type { Route } from "@mateothegreat/svelte5-router";

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
}): Route[] {
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

// @ts-ignore
export { route, Router, type Route } from "@mateothegreat/svelte5-router";
export { getRoutes }; 