// TODO: custom adapter
import type { Options as ClientOptions, TDataShape, Client, RequestResult, Config } from '@hey-api/client-fetch';
import { type Writable, writable } from 'svelte/store';
import { createClient } from '@hey-api/client-fetch';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
  /**
   * You can pass arbitrary values through the `meta` object. This can be
   * used to access values that aren't defined as part of the SDK function.
   */
  meta?: Record<string, unknown>;
};


// Utility type to extract a property if it exists, or return never
type ExtractProp<T, K extends string> = K extends keyof T
  ? T[K] extends object | never ? T[K] : never
  : never;

// Utility type to combine the extracted properties
type CombineParams<T> =
  ([ExtractProp<T, 'body'>] extends [never] ? {} : ExtractProp<T, 'body'>) &
  ([ExtractProp<T, 'query'>] extends [never] ? {} : ExtractProp<T, 'query'>) &
  ([ExtractProp<T, 'path'>] extends [never] ? {} : ExtractProp<T, 'path'>);

// Full API Calls
// Exposes REST params from API
// Ex: call({ params: { id: 1234 } })
export function apiCallRest<A, R>(
  call: (data: A) => RequestResult<R>,
): (data?: A) => Writable<{ loading: boolean, data: R | undefined, error: string | undefined }> {
  return (data: A = {} as A) => {
    const store = writable({ loading: true, data: undefined, error: undefined });
    call({ client: _client, ...data }).then((result) => {
      // @ts-ignore
      store.set({ loading: false, data: result.data, error: result.error });
    });
    return store;
  }
}

// Flat API Calls
// Remaps all params to a single object
// Ex: call({ id: 1234 })
export function apiCallFlat<A, R>(
  call: (data: A) => RequestResult<R>,
  mappings: Record<string, "body" | "query" | "path">
): (data?: CombineParams<A>) => Writable<{ loading: boolean, data: R | undefined, error: string | undefined }> {
  return (data: CombineParams<A> = {} as CombineParams<A>) => {
    const store = writable({ loading: true, data: undefined, error: undefined });

    // Remap params to REST params
    const restData: any = {};
    for (const [key, value] of Object.entries(data)) {
      const paramKey = mappings[key];
      if (paramKey) {
        if (!restData[paramKey]) {
          restData[paramKey] = {};
        }
        restData[paramKey][key] = value;
      } else {
        console.error(`No mapping found for ${key}`);
      }
    }

    // @ts-ignore
    call({ client: _client, ...restData }).then((result) => {
      // @ts-ignore
      store.set({ loading: false, data: result.data, error: result.error });
    });
    return store;
  }
}

let _client: Client | undefined;
export function setupClient(config: Config) {
  _client = createClient(config);
}