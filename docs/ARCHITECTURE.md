# Arquitectura del frontend — mapa del módulo de autenticación

Estado: las **7 pantallas** del módulo de login están integradas, registradas en el árbol de rutas
y recorridas en el navegador (claro y oscuro, es/en/pt). Este documento es el mapa; el porqué de
cada decisión concreta vive en el `docs/README.md` de su carpeta, que es lo que manda
(`harness/01_reglas_globales.md` §5).

## 1. Las capas, de fuera a dentro

```text
main.tsx  →  <Core>  →  <RouterProvider router>          eager: guards, layouts, pantalla de error
                          │
                          ├─ app_routes    /  ·  /revisa-tu-correo
                          ├─ auth_routes   /ingresar · /crear-cuenta · /recuperar-contrasena
                          │                /restablecer-contrasena · /verificar-correo · /oauth/callback
                          └─ error_routes  /sesion-vencida · *
```

| Capa | Carpeta | Regla que la sostiene |
| --- | --- | --- |
| Rutas como datos | `src/routes` | `ROUTES` + `RouteHelpers` son la fuente única; ningún path se escribe a mano (`03_` §8). |
| Guards | `src/components/guards` | `<Auth>` exige sesión —y distingue "no hay sesión" de "la petición falló"—; `<Guest>` saca de las pantallas de auth a quien **ya llegó** con sesión. |
| Capa HTTP | `src/interceptors` | Exactamente dos instancias de axios. Es el único sitio que cierra sesión (401). |
| Estado remoto | `@tanstack/react-query` | Toda llamada al servidor pasa por `useQuery`/`useMutation`. Cero `fetch`, cero API dentro de `useEffect`. |
| Estado global | `src/store` | `user` y `theme`, nada más. Lo del servidor no entra aquí. |
| Dominio | `src/modules/auth` | Lo compartido arriba, una carpeta por pantalla en `features/`. |

## 2. El módulo de auth

```text
src/modules/auth/
├─ adapters/            Api* (snake_case) → *UI (camelCase). Un solo punto de traducción.
├─ keys/                authKeys: me() · verifyEmail(token) · googleExchange(code)
├─ constants/           AUTH_ENDPOINTS (los 11 del contrato) y los límites de contraseña
├─ types/               UserUI, SessionUI, MePayload
├─ services/            me/ (GET /auth/me) · logout/ (POST /auth/logout)
├─ hooks/               use_logout · use_auth_message
├─ utils/               redirect_to · messages · auth_error_message · google_authorize
├─ components/          auth_card · auth_field · auth_form_error · auth_submit_button
│                       auth_divider · auth_footer_link · auth_note · google_button
│                       password_input · password_field
└─ features/            login · register · forgot_password · reset_password
                        verify_email (dos pantallas) · oauth_callback · session_expired
```

**Regla de colocación:** una feature → vive en la feature; dos o más del mismo dominio → sube a
`modules/auth/`; cruza dominios → `src/components/shared`, `src/hooks`, `src/utilities`. Nunca se
importa desde dentro de otra feature.

Lo que la integración subió, y por qué:

| Pieza | Estaba en | Ahora | Motivo |
| --- | --- | --- | --- |
| `password_input` + `password_field` | login, registro y reset, tres copias distintas | `modules/auth/components` | Reset seguía usando `<Input type="password">`, que monta un **segundo** ojo sin nombre accesible. Un solo componente, un solo ojo, `aria-pressed`. |
| `buildGoogleAuthorizeUrl` / `startGoogleAuthorize` | login y registro, duplicado literal | `modules/auth/utils/google_authorize` | Dos copias del mismo endpoint divergen. |
| `authErrorMessage` | `verify_email/utils` | `modules/auth/utils/auth_error_message` | Lo necesitaban seis pantallas. |
| Mapa de `meta.fields` | tres mapas parciales | `modules/auth/utils/messages` | El backend manda claves de i18n **ya montadas**; el mapa a clave tipada tiene que ser uno. |
| Query keys de verify y de exchange | `features/*/keys` | `modules/auth/keys` | Invalidar desde otra feature deja de ser adivinar (`03_` §6). |
| Pantalla 07 | `features/check_email` (re-export puente) | `features/verify_email/pages/check_email` | El puente ya no hace falta: la ruta apunta a la pantalla real y la carpeta se borró. |

## 3. Un solo camino para cada cosa

**El texto de un error.** `authErrorMessage(error, t)` traduce un `ApiError` a una frase y cubre
**los 12 `meta.code`** del contrato (§5) con un `Record<ApiErrorCode, clave>`: si el contrato añade
un código, TypeScript exige la fila. Fuera del mapa quedan solo el fallo de red (`status === 0`) y
el código sin documentar (5xx → `errors.internal_error`, resto → `errors.unknown`). Los segundos de
un `429` salen de `meta.retry_after_seconds` o, si el sobre no los trae, de la cabecera
`Retry-After` que el interceptor también lee (contrato §6); sin ninguna de las dos se usa
`errors.retry_later`, que no inventa segundos.

**Dónde se pinta.** Lo fija `harness/05_diseno_y_ux.md` §5 y aquí no hay excepciones por pantalla:

| Caso | Dónde aparece |
| --- | --- |
| `INVALID_CREDENTIALS`, `ACCOUNT_USES_GOOGLE`, `VALIDATION_ERROR` sin campo | `auth_form_error` bajo el formulario |
| `VALIDATION_ERROR` con `meta.fields` | en el campo, con `aria-invalid` y foco al primero |
| `EMAIL_ALREADY_REGISTERED` | en el campo correo + enlace a iniciar sesión |
| `TOKEN_INVALID` | pantalla propia de enlace caducado, con la acción para pedir otro |
| red, `RATE_LIMITED`, `RESEND_COOLDOWN`, `INTERNAL_ERROR` | toast de `sonner`, con el formulario intacto |
| `SESSION_EXPIRED` | pantalla E7 (la manda el interceptor, no la pantalla) |

**El destino de retorno.** `modules/auth/utils/redirect_to` es la única puerta para las pantallas;
solo el interceptor llama a `@/services/auth_storage` directamente, y es deliberado: importar
`@/modules/auth/**` desde la capa HTTP mete el módulo en el grafo *eager* y rompe el code splitting.

**Quién navega tras iniciar sesión.** La pantalla, no el guard. `<Guest>` mira si había sesión **al
montar**: quien ya llegó autenticado sale de ahí; quien se autentica estando en la pantalla se
queda hasta que la propia pantalla navegue. Sin esto, registrarse con un `redirect_to` guardado
mandaba al usuario a la lección en vez de a `/revisa-tu-correo` — reproducido con el árbol real y
cubierto por `src/__tests__/routes/router/index.test.tsx`.

## 4. Rutas y carga diferida

Todas las páginas entran con `lazyPage(() => import("ruta/literal"))`. El string literal es lo que
Vite necesita para crear el chunk. Medido en `pnpm build` de esta integración:

| Chunk | Pantalla |
| --- | --- |
| `pages-Cr6sZurx.js` (2.2 kB) | catálogo `/` |
| `pages-DWyC1-mX.js` (6.6 kB) | `/ingresar` |
| `pages-Bm9JGlrz.js` (90.6 kB) | `/crear-cuenta` — se lleva el `Select` de `arxatec-ui`, que no usa nadie más |
| `pages-BoQulEG1.js` (5.5 kB) | `/recuperar-contrasena` |
| `pages-CsLkThXx.js` (7.4 kB) | `/restablecer-contrasena` |
| `pages-CnD-1MrQ.js` (4.2 kB) | `/verificar-correo` |
| `check_email-CQOtEXe1.js` (4.4 kB) | `/revisa-tu-correo` |
| `pages-B0hgQcPO.js` (4.6 kB) | `/oauth/callback` |
| `pages-AET-cenq.js` (4.4 kB) | `/sesion-vencida` |

El chunk inicial (`index-*.js`, 315 kB) **no** contiene ninguna de las nueve: comprobado buscando
en él las claves de i18n de cada pantalla (`login.title`, `register.title`, `catalog.title`,
`session_expired.title`) — cero coincidencias. Ningún barril entra en el grafo eager:
`src/routes/index.ts` reexporta solo `routes.ts`.

## 5. Qué falta y quién lo tiene que dar

1. **La lista completa de `meta.fields`.** El contrato §5 solo documenta `auth.errors.email_invalid`.
   `toAuthMessageKey` mapea esa y las `auth.validation.*` que corresponden a campos existentes; el
   resto cae en `errors.validation_error`. Lo tiene que publicar el equipo de service.
2. **`Retry-After` expuesta por CORS en el `429 RATE_LIMITED`.** El contrato §6 garantiza la
   cabecera, y el frontend ya la lee, pero no es CORS-safelisted: hasta que el backend la añada a
   `Access-Control-Expose-Headers`, el navegador no se la entrega y el texto sigue siendo
   `errors.retry_later` (`harness/registro/2026-08-20/CORRECCION_REVISION_LOGIN.md`).
3. **`POST /auth/register` no devuelve `retry_after_seconds`**, así que la pantalla 07 no puede
   pintar "Reenviar en 45 s" antes del primer clic sin inventarse el número.
4. **`useLogout` no lo monta ninguna pantalla todavía**: no hay chrome de app con menú de usuario.
   El catálogo de la fase siguiente debe consumirlo en vez de escribir su propio cierre de sesión.
5. **Los botones `size="lg"` de `arxatec-ui` miden 36 px**, por debajo de los 44 px recomendados
   como objetivo táctil. Es la escala de la librería y afecta a todas las pantallas por igual.
