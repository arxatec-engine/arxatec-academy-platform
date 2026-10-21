# Code style

This guide records the frontend's code conventions and the product and architecture decisions that accompany them. ESLint enforces the configured rules in `eslint.config.js`.

- Organize code under `modules/<domain>/features/<feature>` and add only the directories a feature uses. Use `snake_case` directories, `PascalCase` components, and `useCamelCase` hooks.
- Centralize paths and URL generation in `src/routes/routes.ts`. Keep pages lightweight and manage titles with `useTitle`.
- Preserve the page/component → hook → service → interceptor data flow. HTTP services do not use React; reads and writes use React Query. Do not issue requests from `useEffect`.
- Import design system controls and tokens from `arxatec-ui`. Respect Academy's fonts, sizes, and theme; do not introduce parallel controls or palettes without a product need.
- Use `StatusMessage` from `arxatec-ui` for empty states, section errors, and persistent notices, including validation and general results. Use `size="sm"`, `color="rose"` for section errors, and `color="white"` for empty or informational states. Keep actions outside the message and accessible announcements (`role="alert"` or `role="status"`) on its container. Custom exam introduction and score screens use their own documented presentation. **Do not use `StatusMessage` on 404, server error, or connection error pages**: these share `ErrorScreen`, with `PageShell`, centered title and description, and a compact button. Page-loading failures propagate to the route boundary. Loading states retain their `Skeleton`; transient action notifications retain the shared `Toaster`.
- Use `size="sm"` on every `Input`, `PasswordInput`, and `SelectTrigger`. Text fields, textareas, and selectors must include translated placeholders.
- Reserve `LoaderSplash` for route fallbacks and startup before React. Content and session loading use a single simple `Skeleton` block from `arxatec-ui` per loading state.
- Visible copy lives in i18n resources with the same key in Spanish, English, and Portuguese. Use typed keys and centralized namespaces.
- Validate forms and untrusted responses at their boundaries. Preserve `snake_case` in API contracts and adapt to `camelCase` in module adapters.
- Authenticated and public HTTP clients have distinct purposes. The service selects one according to the contract; never construct an Axios client inside a feature.
- The browser stores only session data required to send the token and presentation preferences. Never store passwords or place secrets in `VITE_` variables.
- Features maintain `docs/README.md` alongside their code. Update documentation in the same change when functional decisions change.
- Do not use `any`, `console.log`, or type suppressions to hide errors. Use pnpm and scripts declared in `package.json`.

Repository checks are documented in [Testing](TESTING.md); module responsibilities are described in [Architecture](ARCHITECTURE.md).
