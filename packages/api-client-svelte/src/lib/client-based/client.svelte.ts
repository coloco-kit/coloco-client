// TODO: custom adapter
import type { Config, RequestResult } from '@hey-api/client-fetch';
import { createClient } from '@hey-api/client-fetch';
import { type APICallOptions } from './api';

export type APIClient = ReturnType<typeof defineClient>;

export type ClientOptions = {
  errorHandler?: (error: Error) => void;
}
export type ClientCallOptions = {
  handleError?: boolean;
  errorHandler?: (error: Error) => void;
}


export function makeRequest<A, R>(call: <ThrowOnError extends boolean = false>(data?: A, options?: APICallOptions) => RequestResult<R>, options: ClientCallOptions & APICallOptions = {}) {
  let request: Request | undefined = $state();
  let response: Response | undefined = $state();
  let data: R | undefined = $state();
  let loading = $state(false);
  let error: Error | undefined = $state();

  async function makeCall(input: A) {
    loading = true;
    // Reset state
    data = undefined;
    error = undefined;
    response = undefined;
    request = undefined;
    try {
      const result = await call(input, options);
      data = result.data;
      request = result.request;
      response = result.response;
      if ('error' in result) {
        error = result.error as Error;
      }
    } catch (e) {
      error = e as Error;
    } finally {
      loading = false;
    }
    // Handle error if not disabled
    if (error && options.errorHandler && options.handleError !== false) {
      options.errorHandler(error);
    }
  }

  return {
    call: makeCall,
    get request() {
      return request;
    },
    get response() {
      return response;
    },
    get data() {
      return data;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    __svelte: true
  };
};



export function defineClient<T>(endpoints: T): (config: Config & ClientOptions) => T {
  return (config: Config & ClientOptions) => {
    const restClient = createClient(config);
    const errorHandler = config.errorHandler || (() => {});
    const baseOptions = {errorHandler, client: restClient};

    function bindClient(_endpoints: any) {
      for (const [key, value] of Object.entries(_endpoints)) {
        if (typeof value === 'function') {
          _endpoints[key] = (input: any, options: any = {}) => value(input, {...baseOptions, ...options})
        } else {
          bindClient(value);
        }
      }
    }
    bindClient(endpoints);

    return endpoints;
  };
}