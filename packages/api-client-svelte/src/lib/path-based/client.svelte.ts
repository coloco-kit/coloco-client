// TODO: custom adapter
import type { Client, Config, RequestResult } from '@hey-api/client-fetch';
import { createClient } from '@hey-api/client-fetch';
import type { APICallOptions } from './api';

export type APIClient = ReturnType<typeof makeClient>;
export let defaultClient: APIClient | undefined;
export function setDefaultClient(client: APIClient) {
  defaultClient = client;
}

export type ClientOptions = {
  errorHandler?: (error: Error) => void;
}
export type ClientCallOptions = {
  handleError?: boolean;
}

export function makeClient(config: Config & ClientOptions) {
  const restClient = createClient(config);
  const errorHandler = config.errorHandler || (() => {});

  return {
    restClient,
    makeRequest: <A, R>(call: <ThrowOnError extends boolean = false>(data?: A, options?: APICallOptions) => RequestResult<R>) => {
        let request: Request | undefined = $state();
        let response: Response | undefined = $state();
        let data: R | undefined = $state();
        let loading = $state(false);
        let error: Error | undefined = $state();
    
        async function makeCall(input: A, options: APICallOptions & ClientCallOptions = {}) {
          loading = true;
          // Reset state
          data = undefined;
          error = undefined;
          response = undefined;
          request = undefined;
          try {
            const result = await call({ ...input }, { client: restClient, ...options });
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
          if (error && errorHandler && options.handleError !== false) {
            errorHandler(error);
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
        };
      },
  };
}
