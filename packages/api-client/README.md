# @coloco/api-client

A client for interacting with Coloco APIs.

## Installation

```bash
npm install @coloco/api-client
```

## Usage

```typescript
import { ApiClient } from '@coloco/api-client';

// Create an API client instance
const apiClient = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'X-API-Key': 'your-api-key',
  },
});

// Make a GET request
const user = await apiClient.get('/users/123');

// Make a POST request
const newUser = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Make a PUT request
const updatedUser = await apiClient.put('/users/123', {
  name: 'Jane Doe',
});

// Make a DELETE request
await apiClient.delete('/users/123');
```

## API

### `ApiClient`

The main API client class.

#### Constructor

```typescript
constructor(options: ApiClientOptions)
```

- `options.baseURL`: The base URL for the API
- `options.timeout`: The request timeout in milliseconds (default: 10000)
- `options.headers`: Additional headers to include in requests

#### Methods

##### `get<T>(url: string, config?: AxiosRequestConfig): Promise<T>`

Make a GET request to the API.

##### `post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>`

Make a POST request to the API.

##### `put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>`

Make a PUT request to the API.

##### `delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>`

Make a DELETE request to the API.

## License

MIT 