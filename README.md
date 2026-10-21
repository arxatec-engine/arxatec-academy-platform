# Arxatec Academy Platform

A learning SPA built with React 19, TypeScript, and Vite. It connects to `arxatec-academy-service` over REST and provides a public catalog, courses and lessons, progress, comments, account management, and tools restricted to administrators.

Start with [`docs/README.md`](docs/README.md). The implementation in `src/` and the service contracts define the supported behavior.

## Requirements

- Node.js 24.
- **pnpm**, pinned in `packageManager`. Use the scripts declared in `package.json`.
- Infisical CLI >=0.43.145 with access to the project in `.infisical.yaml`.

## Getting started

```sh
pnpm install --frozen-lockfile
infisical login
pnpm dev
```

Set `VITE_API_URL` in the frontend project's Infisical `dev` environment before starting. For local development, use `http://localhost:3001/api/v1`. This frontend has its own Infisical project. The variable is read only through `src/config/env` and becomes part of the public browser bundle.

`pnpm build:dev` builds with `dev` variables. `pnpm build:prod` and `pnpm build` use `prod`. The `dev:local`, `build:local`, and `preview:local` variants use variables already supplied to the process. Local environment files are not included in this repository. See [Environment](docs/ENV.md).

## Verification

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
VITE_API_URL=https://api.example.test/api/v1 pnpm build:local
```

The example URL above is only for compilation checks. Set the actual production API URL in Infisical before creating a release. See [Deployment](docs/DEPLOYMENT.md).

## Repository map

| Directory                   | Contents                                           | Documentation                                             |
| --------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `src/config/env`            | Centralized Vite configuration                     | [`docs/ENV.md`](docs/ENV.md)                              |
| `src/interceptors`          | Authenticated and public Axios clients; API errors | `src/interceptors/docs/README.md`                         |
| `src/services/auth_storage` | Session persistence and return destination         | `src/services/auth_storage/docs/README.md`                |
| `src/routes`                | Centralized paths and route trees                  | `src/routes/docs/README.md`                               |
| `src/modules/auth`          | Sign-in, registration, email, and recovery         | `src/modules/auth/docs/README.md`                         |
| `src/modules/catalog`       | Catalog, course details, and lessons               | Each feature's README                                     |
| `src/modules/progress`      | My courses, progress, exams, and certificates      | `src/modules/progress/features/my_courses/docs/README.md` |
| `src/modules/comments`      | Lesson discussions                                 | `src/modules/comments/docs/README.md`                     |
| `src/modules/profile`       | Profile and account                                | `src/modules/profile/features/profile/docs/README.md`     |
| `src/modules/admin`         | Courses, students, notifications, and moderation   | Each feature's README                                     |
| `src/__tests__`             | Service, hook, routing, and UI unit tests          | [`docs/TESTING.md`](docs/TESTING.md)                      |

Tailwind CSS 4 and `arxatec-ui` supply styles, components, and visual tokens. `src/index.css` loads the package CSS first; `@source "../node_modules/arxatec-ui/dist/**/*.js"` detects classes used by the library.
