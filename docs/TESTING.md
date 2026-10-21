# Testing

Available scripts are defined in `package.json`. From the project root:

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
VITE_API_URL=https://api.example.test/api/v1 pnpm build:local
```

`typecheck` runs `tsc -b --noEmit`. `build:local` runs `tsc -b && vite build` without consulting Infisical. `build` aliases `build:prod`; `build:dev` and `build:prod` load their variables through Infisical. The build URL above is a compilation fixture, not a deployed API. Tests use Vitest, Testing Library, and jsdom. UI tests do not replace manual verification of navigation, appearance, and behavior in real browsers.

## Current coverage

`src/__tests__/` follows the application's modules and responsibilities. Current coverage includes:

- Guest, session, and role guards; sessions, tokens, post-authentication return destinations, sign-out, and interceptors.
- Schemas, services, and screens for registration, sign-in, Google OAuth, password recovery/reset, and email verification.
- Route tree and navigation, language selection, and translation-key parity.
- Catalog and search, service contracts, lesson views, and lesson states.
- Queries and mutations for progress, comments, interest requests, profiles, and administration tools.
- Final exam navigation, grading responses, retries, certificates, and course completion entry points.

Use `rg --files src/__tests__` to inspect the actual suites. Unit tests do not establish connectivity to a real backend, deployed OAuth behavior, or presentation in every browser.

## Manual walkthrough

When changing a screen or account flow, visit the affected routes with the local API configured through Infisical or process variables. Review the catalog, course details, a public sample, a locked lesson, registration/sign-in and return navigation, My courses, and Profile as relevant. Check loading, error, and empty states, all three languages, light/dark themes, keyboard use, and a mobile viewport. For administrative content changes, sign in as `ADMIN` and verify that a student cannot use those routes.

Authentication changes also require remembered and tab-only sessions, refresh, sign-out, unverified and verified email, network errors, and returning from a protected link. API changes require checking the envelope and authorization on the backend too.

## Loading splash

`routes/lazy.test.tsx` checks that the splash exists before JavaScript downloads and remains through `RouteFallback` while a lazy page resolves. `loading_screen` tests verify that content and session loading use `Skeleton` without a brand mark and retain one translated accessible announcement.

In development, open `/?preview=splash` to review the 2 rem brand mark, its diagonal shimmer, light/dark themes, and absence of visible text, matching Admin.

## Profile settings

Tests of the real route tree verify that the header exposes no settings with or without a session; My account opens Profile with personal details and language/theme selectors; settings apply and persist in the browser; and guests visiting `/perfil` are redirected to sign-in. The separate settings route no longer exists. Key parity covers Spanish, English, and Portuguese.
