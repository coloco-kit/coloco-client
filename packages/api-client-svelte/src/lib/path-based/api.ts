// TODO: custom adapter
import type { Client, RequestResult } from '@hey-api/client-fetch';
import { defaultClient } from './client.svelte';

// Utility type to extract a property if it exists, or return never
type ExtractProp<T, K extends string> = K extends keyof T
  ? T[K] extends object | never ? T[K] : never
  : never;

// Utility type to combine the extracted properties
type CombineParams<T> =
  ([ExtractProp<T, 'body'>] extends [never] ? {} : ExtractProp<T, 'body'>) &
  ([ExtractProp<T, 'query'>] extends [never] ? {} : ExtractProp<T, 'query'>) &
  ([ExtractProp<T, 'path'>] extends [never] ? {} : ExtractProp<T, 'path'>);

export type APICallOptions = {
  client?: Client;
}

// Full API Calls
// Exposes REST params from API
// Ex: call({ params: { id: 1234 } })
export function apiCallRest<A, R>(
  call: (data: A) => RequestResult<R>,
): (data?: A, options?: APICallOptions) => RequestResult<R> {
  return (data: A = {} as A, options: APICallOptions = {}) => {
    return call({ client: options?.client || defaultClient?.restClient, ...data });
  }
}

// Flat API Calls
// Remaps all params to a single object
// Ex: call({ id: 1234 })
export function apiCallFlat<A, R>(
  call: (data: A, ) => RequestResult<R>,
  mappings: Record<string, "body" | "query" | "path">
): (data?: CombineParams<A>) => RequestResult<R> {
  return (data: CombineParams<A> = {} as CombineParams<A>, options: APICallOptions = {}) => {
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
    return call({ client: options?.client || defaultClient?.restClient, ...restData });
  }
}


// Types needed to make the apiCallFlat recognized by vscode
// TODO: Figure out how to make typescript happy and not need these
export type APIResultType<A, R> = (data?: CombineParams<A>) => R
export type APIArgumentTypes<T extends (...args: any) => any> = Parameters<T>;