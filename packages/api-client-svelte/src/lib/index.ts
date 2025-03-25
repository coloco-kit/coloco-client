// export { apiCallFlat, apiCallRest, type APICallOptions } from './client-based/api';
// export { defineConfig as codegenConfig } from './client-based/codegen/config';
// export { defineClient, makeRequest, type ClientOptions, type ClientCallOptions } from './client-based/client.svelte';

export { apiCallFlat, apiCallRest, type APICallOptions, type APIResultType, type APIArgumentTypes } from './path-based/api';
export { defineConfig as codegenConfig } from './path-based/codegen/config';
export { setDefaultClient, makeClient, type ClientOptions, type ClientCallOptions } from './path-based/client.svelte';