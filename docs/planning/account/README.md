# Account and access

`src/modules/auth` covers sign-in options (`/ingresar`), email sign-in (`/ingresar/correo`), registration (`/crear-cuenta`), Google OAuth exchange, email verification/resending, forgotten and reset passwords, current-user lookup, and sign-out. Screens are public or guest-only except states that consume a token or require a session.

## Registration and sessions

Email registration requests full name, email, and password. The schema normalizes email and adapts `fullName` to the service's `full_name`. Registration returns a session and navigates to the email review screen. Google starts through `/auth/google`, returns a one-time code, and the client exchanges it at `/auth/google/exchange`.

Unverified email does not block course access; the API requires verified email to post or reply to comments. Sign-in supports remembering the session: token/user are stored locally or for the tab, respectively. Passwords are never persisted.

`redirect_to` retains a requested internal route during sign-in, registration, and OAuth. `sanitizeRedirectPath` restricts it to a safe relative path. When a session expires, Axios clears its information and redirects once to the expired-session state.

## Rules for changes

Use public Axios for sign-in, registration, OAuth exchange, and unauthenticated token actions. Use authenticated Axios for `/auth/me`, sign-out, and authenticated resending. Forms validate through Zod, convert API messages into i18n keys, and retain input when submission fails. The backend remains responsible for credentials, tokens, rate limits, and identity.

Routes and session types are defined in `src/routes/routes.ts` and `src/types/auth`. Shared architecture is detailed in [`src/modules/auth/docs/README.md`](../../../src/modules/auth/docs/README.md); maintain the auth contract together with the service.
