# Frontend architecture

## Product and structure

Academy is a React 19 SPA with strict TypeScript. It provides free legal tech courses, video or article lessons, student progress, comments, and account management. Courses can be browsed without signing in; private routes require an account, and the backend checks every operation again.

```text
src/
├── components/{guards,layout,shared}/
├── config/env/                 # centralized VITE_API_URL reader
├── constants/                  # errors and browser storage keys
├── hooks/                      # session, language, theme, and title
├── interceptors/               # axiosInstance and axiosPublicInstance
├── locales/{es,en,pt}/         # common and auth
├── modules/
│   ├── auth/                   # registration, login, Google, recovery, and email
│   ├── catalog/features/       # catalog, course details, and lessons
│   ├── progress/               # My courses, enrollment, completion, exams, certificates
│   ├── comments/               # lesson threads
│   ├── profile/                # personal details, avatar, password, and deletion
│   ├── notifications/          # notifications and topic proposals
│   └── admin/                  # content, moderation, students, and notifications
├── routes/                     # centralized routes and lazy loading
├── services/auth_storage/      # session persistence and return destination
├── store/{user,theme}/         # minimal browser state
├── types/                      # shared API contracts
└── __tests__/                  # tests organized by module
```

Optional directories appear when a module needs them. A feature groups its pages, components, hooks, services, types, validation, and documentation. Pages compose the screen; remote reads and writes go through React Query hooks and HTTP services.

## Data flow

```text
route → guard → page → component → React Query hook → service → Axios interceptor → API
```

`src/types/services` defines the `Response<T>` envelope. Services check that responses contain the required data and return the `data` payload. Module adapters convert API `snake_case` fields into the shape presented by the UI. Infrastructure normalizes failures into `ApiError`, including status, code, and description. There are no API requests inside JSX or `useEffect`.

`axiosInstance` attaches the user's token for authenticated operations. `axiosPublicInstance` sends no credentials and prevents errors from public endpoints from terminating the active session. Both share `ENV.API_URL`; services select the client according to the endpoint and access level.

React Query owns remote responses. Defaults in `src/utilities/query` use a 30-second freshness period, no refetch on window focus, and up to two retries except for client errors. Query keys are grouped by module. Mutations invalidate or update related queries.

## Sessions, roles, and routes

`src/routes/routes.ts` is the single source for routes and helpers. `lazyPage` loads pages on demand. `Auth` protects My courses, Profile, and email review; `Admin` additionally checks the `ADMIN` role for staff tools. These are navigation controls, not a security boundary: the service validates sessions, permissions, data ownership, and business rules.

Sign-in accepts email and password with an option to remember the session. Registration requests name, email, and password; both registration and Google create a session. Password and Google sign-in share account navigation. Email verification and recovery use token links. An unverified email can browse courses, but the backend requires verification to comment.

The token and public user snapshot are stored in `localStorage` for remembered sessions and in `sessionStorage` for tab-only sessions. Axios reads the token when sending each request. Passwords are not stored. `redirect_to` is validated and retained in session storage so authentication can return to the requested page. Session expiration clears data and offers a return route.

| Route                                                        | Access                            | Purpose                                                           |
| ------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------- |
| `/`                                                          | Public                            | Catalog with search, topic, and level filters.                    |
| `/cursos/:slug`                                              | Public                            | Course description and syllabus.                                  |
| `/cursos/:course_slug/lecciones/:lesson_slug`                | Public, content depends on access | Accessible lesson or locked state with syllabus.                  |
| `/ingresar`                                                  | Guest                             | Sign-in options, including Google.                                |
| `/ingresar/correo`, `/crear-cuenta`                          | Guest                             | Email sign-in and student registration.                           |
| `/recuperar-contrasena`, `/restablecer-contrasena`           | Guest/link                        | Password recovery and reset.                                      |
| `/verificar-correo`, `/revisa-tu-correo`                     | Link/session                      | Email confirmation and status.                                    |
| `/oauth/callback`                                            | Google flow                       | One-time code exchange.                                           |
| `/mis-cursos`, `/perfil`                                     | Session                           | Personal learning and account.                                    |
| `/cursos/:slug/examen`                                       | Session                           | Final exam with 15 questions to earn a certificate.               |
| `/admin/cursos`, `/admin/cursos/:id`, `/admin/lecciones/:id` | ADMIN role                        | Course and lesson creation and maintenance.                       |
| `/admin/comentarios`, `/admin/usuarios`, `/admin/avisos`     | ADMIN role                        | Comment moderation, student directory, and notification requests. |
| `/sesion-vencida` and `*`                                    | Public                            | Closed session and route not found.                               |

`ROUTES` and `RouteHelpers` remain the final reference if a route changes. Page titles are translated and updated through `useTitle`, which appends ` - Arxatec Academy`.

## Learning experience

The catalog reads published courses from `GET /courses`; search, topic, and level are stored in the URL and included in the query key. Public course details present the syllabus. Starting a course enrolls an authenticated user. Visitors can open a sample and are offered registration or sign-in to continue. `GET /courses/:course_slug/lessons/:lesson_slug` may return `403 LESSON_LOCKED`; the service converts that response into a locked-content state retaining the course context.

Lessons compose YouTube/Vimeo video, article HTML sanitized by the backend, transcripts, and resources. Comment threads are publicly readable; the backend restricts posting and replies to accounts with verified email. My courses displays courses in progress and completed courses. Marking a lesson invalidates that query so returning to the list reflects the change.

Completing the lessons unlocks the final exam. A certificate requires passing a 15-question exam, with 12 correct answers as the initial threshold. Administrators configure questions, options, correct answers, the passing threshold, and availability in each course editor. The browser submits only the version and selected answers; the service grades the exam, records the attempt, and issues a certificate on passing.

Profile supports editing personal details, photos, passwords for password accounts, reviewing a summary, and requesting account deletion. Server responses update the session user; account deletion clears both session and cache. The backend owns final validation.

## Internationalization and presentation

`i18next` provides Spanish, English, and Portuguese. Spanish is the default, and the browser retains the language preference. Resources are divided into `common` and `auth` namespaces; TypeScript derives keys from the Spanish resources, and the resource test checks parity across languages.

The UI uses Tailwind CSS 4 and `arxatec-ui`. Light, dark, or system theme and language are controlled from My account → My profile (`/perfil`) while signed in. The header does not contain these controls. Preferences remain in this browser. `src/index.css` imports the package theme and defines article reading styles. `vite.config.ts` adapts font families in the package CSS to Academy's sans font.

## Configuration and boundaries

`src/config/env` is the only reader of `import.meta.env`. `VITE_API_URL` is public and points to the `/api/v1` prefix. Vite and the available scripts are described in `package.json`. See [Environment](ENV.md) and [Testing](TESTING.md) for startup, checks, and builds.
