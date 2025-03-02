# @coloco/router

A routing library for Coloco applications.

## Installation

```bash
npm install @coloco/router
```

## Usage

```typescript
import { Router } from '@coloco/router';

// Define your routes
const routes = [
  { path: '/', component: HomeComponent, exact: true },
  { path: '/users', component: UsersComponent },
  { path: '/about', component: AboutComponent, exact: true },
];

// Create a router instance
const router = new Router({
  routes,
  defaultRoute: '/'
});

// Navigate to a path
const route = router.navigate('/users/123');

// Render the component
if (route) {
  renderComponent(route.component);
}
```

## API

### `Router`

The main router class.

#### Constructor

```typescript
constructor(options: RouterOptions)
```

- `options.routes`: An array of route objects
- `options.defaultRoute`: The default route to navigate to when no match is found (default: '/')

#### Methods

##### `navigate(path: string): Route | null`

Navigate to a specific path and return the matching route.

### `Route`

An interface representing a route.

- `path`: The path to match
- `component`: The component to render
- `exact`: Whether the path should match exactly (default: false)

## License

MIT 