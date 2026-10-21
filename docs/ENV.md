# Environment

The frontend reads only `VITE_API_URL`, through `src/config/env/index.ts`. It is public configuration embedded in the bundle and points to the API base URL, including `/api/v1`.

```sh
VITE_API_URL=http://localhost:3001/api/v1 pnpm dev:local
```

That address is the code's local fallback. The local Academy API must be available there. Production builds must explicitly receive their actual API URL; a successful compilation alone does not verify that endpoint.

## Infisical

The `infisical` script reads `secrets-management.project-id` from `.infisical.yaml` with the `yaml` package and passes it to the CLI as `--projectId`, including with machine identity authentication. Infisical CLI >=0.43.145 is required for development, CI, and deployment.

The frontend project is independent of the service. Set `VITE_API_URL` at `/` in `dev` and `prod`, using the API URL for each environment. It is the only application variable required by this Infisical project.

From the frontend root:

```sh
pnpm install --frozen-lockfile
infisical login
pnpm dev
```

| Command                                                      | Configuration                                      |
| ------------------------------------------------------------ | -------------------------------------------------- |
| `pnpm dev`                                                   | Infisical `dev`, then Vite.                        |
| `pnpm build:dev`                                             | Infisical `dev`, then TypeScript and Vite.         |
| `pnpm build:prod` / `pnpm build`                             | Infisical `prod`, then TypeScript and Vite.        |
| `pnpm preview`                                               | Infisical `prod`; serves the existing `dist`.      |
| `pnpm dev:local` / `pnpm build:local` / `pnpm preview:local` | No Infisical request; use the process environment. |

Infisical injects variables before launching Vite. Process variables take precedence over native Vite environment files. This repository does not include a local `.env`; supply configuration through Infisical or the process environment. Restart Vite after changing variables. `preview` neither rebuilds nor changes a URL already embedded in the bundle; run the matching build to do that.

The variable name is the same in development and builds. Vite exposes `VITE_*` values to the client. Never put passwords, OAuth secrets, storage keys, or service credentials in this variable or in the bundle.

The current contract defines no other `VITE_*` variable. Check [`src/config/env`](../src/config/env/index.ts) and [Deployment](DEPLOYMENT.md) when changing configuration.
