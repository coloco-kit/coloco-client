import type { Plugin } from '@hey-api/openapi-ts';

import { handler } from './plugin';
import type { Config } from './types';

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: () => { },
  name: 'coloco-codegen',
  output: 'coloco',
  paramStyle: 'flat',
};

export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});