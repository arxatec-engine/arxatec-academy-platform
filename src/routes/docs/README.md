# `src/routes` — rutas como datos

`routes.ts` es la **fuente única**. Nadie escribe un path a mano: `navigate("/login")` compila,
pasa el lint y en runtime cae en el catch-all (`harness/03_reglas_frontend.md` §8).

| Pieza | Qué es |
| --- | --- |
| `routes.ts` | `ROUTES`, `ROUTE_PARAM_NAMES`, `ROUTE_QUERY_PARAM_NAMES` y `RouteHelpers`. |
| `lazy.ts` | `lazyPage(loader)`: devuelve el elemento ya envuelto en `<Suspense>`. |
| `auth_routes/`, `app_routes/`, `error_routes/` | Los tres árboles. |
| `router/` | `routeTree` (los tres árboles + el `errorElement`) y el `createBrowserRouter` que lo monta. |

## `ROUTE_PARAM_NAMES` está vacío a propósito

Ninguna ruta del módulo de login tiene segmento dinámico: todo lo variable (`token`, `code`) viaja
en la query, que es lo que fija el contrato (`harness/04_contrato_api_auth.md` §8). El objeto se
declara igual para que la ruta con parámetros que llegue con el catálogo lo llene en vez de
inventarse una convención nueva. `RouteHelpers` ya envuelve `generatePath`, así que soportar un
`:course_slug` es añadir el nombre aquí y el helper abajo.

**`generatePath` se importa de `react-router-dom`, no de `react-router`**: con el `node_modules`
estricto de pnpm, `react-router` no es dependencia directa y `tsc` da TS2307.

## Reparto de los árboles

- **`auth_routes`**: `<AuthLayout>` para todas; dentro, `<Guest>` envuelve login, registro y
  recuperación. Reset, verificación y `oauth/callback` cuelgan del layout **sin** guard porque
  consumen un token del correo y deben funcionar con sesión abierta.
- **`app_routes`**: `/` (catálogo, público) y, tras `<Auth>`, `/revisa-tu-correo`, que necesita el
  correo del usuario y el `POST /auth/email/resend` con Bearer.
- **`error_routes`**: `/sesion-vencida` (E7, sin guard: quien llega ahí ya no tiene sesión) y el
  catch-all `*`. Van **al final** del array del router.

## Carga diferida

Todas las páginas entran por `lazyPage(() => import("ruta/literal"))`. El **string literal** no es
estilo: Vite necesita verlo para crear el chunk. Comprobado en `pnpm build`: una entrada por
pantalla, ninguna de ellas dentro del chunk inicial (ver `docs/ARCHITECTURE.md`).

**Ningún barril en el grafo eager.** `src/routes/index.ts` reexporta solo `routes.ts`; si algún día
reexportara `router/`, importar `@/routes` desde el interceptor arrastraría la app entera al chunk
inicial y rompería el code splitting en silencio.

## Inventario

| Clave | Path | Helper | Árbol |
| --- | --- | --- | --- |
| `home` | `/` | `RouteHelpers.home()` | app (público) |
| `login` | `/ingresar` | `RouteHelpers.login()` | auth · `<Guest>` |
| `register` | `/crear-cuenta` | `RouteHelpers.register()` | auth · `<Guest>` |
| `forgot_password` | `/recuperar-contrasena` | `RouteHelpers.forgotPassword()` | auth · `<Guest>` |
| `reset_password` | `/restablecer-contrasena` | `RouteHelpers.resetPassword(token?)` | auth |
| `verify_email` | `/verificar-correo` | `RouteHelpers.verifyEmail(token?)` | auth |
| `oauth_callback` | `/oauth/callback` | `RouteHelpers.oauthCallback(code?)` | auth |
| `check_email` | `/revisa-tu-correo` | `RouteHelpers.checkEmail()` | app · `<Auth>` |
| `session_expired` | `/sesion-vencida` | `RouteHelpers.sessionExpired()` | error |
| `not_found` | `*` | — | error |

`src/__tests__/routes/trees.test.ts` comprueba que **todos** los paths de `ROUTES` están
registrados y que ninguno se repite. `src/__tests__/routes/router/index.test.tsx` monta el árbol
real con `createMemoryRouter` y recorre las nueve pantallas: cada una pinta su `h1`, los guards
mandan donde toca y una ruta inventada cae en el `*` — que sigue siendo el último del array.
