# Deployment

The frontend builds into static files under `dist/`. The API and its secrets are configured and deployed separately in `arxatec-academy-service`. The browser receives only the public API address.

## Building with Infisical

Install Infisical CLI >=0.43.145 and grant it access to the project in `.infisical.yaml`. Development machines use `infisical login`; deployment must supply its own CLI authentication. Set `VITE_API_URL` at `/` in the `prod` environment before building. Use the actual HTTPS API base URL, including `/api/v1`.

Include `.infisical.yaml` in the build directory. The script passes its `project-id` explicitly to support machine identity authentication.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build:prod
pnpm preview
```

`pnpm build` aliases `build:prod`. `pnpm build:dev` uses `dev` variables for a development build. Both run TypeScript and Vite. `pnpm preview` loads `prod` and serves the existing compiled directory for local artifact review. `VITE_API_URL` is embedded in client files: changing it in Infisical requires rebuilding.

For code checks without Infisical, use `pnpm build:local` and `pnpm preview:local` with configuration injected into the process. For example, `VITE_API_URL=https://api.example.test/api/v1 pnpm build:local` checks compilation only. This example endpoint is not a production deployment. Local `.env` files are not shipped.

## Hosting

Publish `dist/` to HTTPS hosting configured for an SPA. The static server must return `index.html` for application routes such as `/mis-cursos` and `/cursos/:slug`, while retaining 404 responses for missing asset files. Configure the service's CORS for the authorized web origin and its methods according to the API contract.

Hashed assets can be cached for their versioned lifetime. `index.html` must remain refreshable so browsers discover new builds. The final domain, reverse proxy, certificates, monitoring, and credentials belong to deployment infrastructure.

After publishing, verify the configured origin, direct loading of public and private routes, guest and signed-in access, sign-out, password reset, OAuth callback, themes, and languages. Do not use production data for destructive tests.
