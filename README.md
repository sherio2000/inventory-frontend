# Inventory Manager — Frontend

React single-page application for the Inventory Manager. Provides authentication
(including two-factor auth), and a product dashboard with search, filtering,
sorting, and pagination.

The API lives in a separate repository: **inventory-backend**.

## Tech Stack

- React 18, React Router
- Vite
- Axios

## Running Locally

Requires Node.js 20+ and the backend running on `http://localhost:8080`.

```bash
npm install
npm run dev
```

The app is served on `http://localhost:5173`. During development Vite proxies
`/api` requests to `http://localhost:8080`.

## Building

```bash
npm run build
```

The production bundle is emitted to `dist/`.

## Docker

The image serves the built assets with nginx and reverse-proxies `/api` to the
backend. The upstream is configurable through the `BACKEND_URL` environment
variable (default `http://backend:8080`).

```bash
docker build -t inventory-frontend .
docker run -p 8081:80 -e BACKEND_URL=http://host.docker.internal:8080 inventory-frontend
```

When running alongside the backend on a shared Docker network, the default
`http://backend:8080` resolves to the backend service directly.

## Continuous Integration

`.github/workflows/ci.yml` installs dependencies and builds the app on every push
and pull request. On pushes to `main` it builds the Docker image and publishes it
to the GitHub Container Registry as `ghcr.io/<owner>/inventory-frontend`.

## Project Structure

```
src/
├── api/         Axios client and token handling
├── auth/        authentication context
├── components/  layout and shared UI
└── pages/       login, register, dashboard, security
```
