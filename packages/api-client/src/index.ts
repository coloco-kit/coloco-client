/**
 * @coloco/api-client - A client for interacting with Coloco APIs
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiClientOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API Client for interacting with Coloco APIs
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(options: ApiClientOptions) {
    this.client = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Make a GET request to the API
   * @param url - The URL to request
   * @param config - Optional Axios request configuration
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request to the API
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional Axios request configuration
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request to the API
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional Axios request configuration
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request to the API
   * @param url - The URL to request
   * @param config - Optional Axios request configuration
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export default ApiClient; 