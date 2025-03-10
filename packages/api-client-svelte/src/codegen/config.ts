import type { Plugin } from '@hey-api/openapi-ts';

import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: () => { },
  name: 'coloco-codegen',
  output: 'coloco-codegen',
  outputPath: './api',
  paramStyle: 'flat',
  baseFunctionName: (name: string) => `_${name}Request`,
  functionName: (name: string) => name,
};

export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});