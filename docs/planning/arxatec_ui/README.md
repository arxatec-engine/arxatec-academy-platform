# Visual system and components

The application uses `arxatec-ui` for the logo, controls, menus, dialogs, cards, tables, and states. `src/index.css` loads the package CSS first, then Academy-specific styles. The Vite plugin adjusts dependency CSS to retain the platform's sans typography.

## Visible patterns

- `BrandLink` presents the Academy logo and returns to the catalog.
- `SiteHeader` offers catalog navigation and My courses when signed in; `AccountMenu` links to Profile and administration tools for `ADMIN`. Language and theme settings are available in Profile.
- `PageShell` combines header, content, and footer, with a reading width suitable for lessons.
- `AuthLayout` and `AuthCard` share the presentation of access screens.
- `CourseCover` prioritizes service-provided images and uses local WebP fallbacks.
- `AsyncBoundary`, `ErrorScreen`, `LoadingScreen`, and `StatusMessage` present asynchronous UI states. Exam introduction and results have dedicated centered components.

Visible copy is translated through `i18next`; controls retain focus states and accessible labels. Pages must support light/dark themes and mobile widths. Avoid rebuilding controls in custom HTML/CSS when `arxatec-ui` already provides them.

Header details, skip links, authentication cards, layout, and reading styles are documented beside their components, for example `src/components/layout/page_shell/docs/README.md` and `src/components/shared/course_cover/docs/README.md`.
