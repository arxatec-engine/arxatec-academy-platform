# `src/modules/auth/utils`

| Carpeta              | Qué es                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------- |
| `redirect_to`        | El destino de retorno: escribirlo, leerlo, validarlo y olvidarlo.                      |
| `messages`           | Las claves de mensaje de formulario del módulo y el mapa `meta.fields` → clave tipada. |
| `auth_error_message` | `ApiError` → frase, cubriendo los 12 `meta.code` del contrato.                         |
| `google_authorize`   | La URL de `GET /auth/google` y el salto al proveedor.                                  |

## `redirect_to` — el destino de retorno, con una sola puerta

El brief promete tres veces que el usuario "vuelve justo aquí". Ese destino viaja en
`sessionStorage` bajo `LOCAL_STORAGE_KEYS.REDIRECT_TO` y este módulo es **el vocabulario común**
para escribirlo y leerlo: `rememberReturnPath`, `readReturnPath`, `consumeReturnPath`,
`forgetReturnPath`, `readReturnPathFromSearch` y `resolveReturnPath`.

### Por qué se valida y qué se rechaza

Un `redirect_to` que acepte un host convierte el login en un **redirector abierto**: `/ingresar`
autentica de verdad y luego manda al usuario a `https://malo.pe/…`, que es el patrón clásico de
phishing (contrato §7.1). La validación es `sanitizeRedirectPath`
(`src/utilities/redirect/index.ts:22`), la misma función pura que testea el backend:

| Se acepta                      | Se rechaza                                                                |
| ------------------------------ | ------------------------------------------------------------------------- |
| `/curso/fundamentos/leccion/3` | `https://malo.pe/robo` (esquema y host)                                   |
| `/?q=1#minuto-12`              | `//malo.pe` (URL protocol-relative: el navegador la trata como absoluta)  |
|                                | `/\malo.pe` y `/%2f%2fmalo.pe` (las formas escapadas del mismo truco)     |
|                                | `curso/x` (no empieza por `/`) y cualquier cosa con caracteres de control |

Se valida **al escribir y al leer**. Leer también, porque `sessionStorage` lo edita cualquiera
desde la consola del navegador: `readReturnPath()` devuelve `null` ante un valor manipulado en
vez de confiar en que se validó cuando se guardó.

### Quién debe usarlo

| Sitio                                                                   | Qué usa                                        |
| ----------------------------------------------------------------------- | ---------------------------------------------- |
| `<Auth>` (`src/components/guards/auth/index.tsx:22`)                    | `rememberReturnPath`                           |
| `<Guest>` (`src/components/guards/guest/index.tsx:11`)                  | `readReturnPath` / `forgetReturnPath`          |
| Verificación sin sesión (`features/verify_email/pages/index.tsx:51`)    | `rememberReturnPath`                           |
| Pantalla E7 (`features/session_expired`)                                | `rememberReturnPath` y `forgetReturnPath`      |
| Login (`features/login/components/login_form`)                          | `consumeReturnPath`                            |
| Recuperación (`features/forgot_password/hooks/use_forgot_password`)     | `readReturnPath`                               |
| Callback de Google (`features/oauth_callback/hooks/use_oauth_exchange`) | `readReturnPath` / `forgetReturnPath`          |
| Salto a Google (`utils/google_authorize`)                               | `readReturnPath`                               |
| Interceptor del 401 (`src/interceptors/index.ts:124`)                   | `writeRedirectTo` de `@/services/auth_storage` |

La integración unificó las cuatro pantallas que llamaban directamente a `@/services/auth_storage`:
mismo comportamiento (las dos capas pasan por `sanitizeRedirectPath`), una puerta menos.

Que el interceptor siga llamando a la capa de almacenamiento es **deliberado**: importar
`@/modules/auth/**` desde la capa HTTP mete el módulo entero en el grafo _eager_ y rompe el code
splitting (`harness/03_reglas_frontend.md` §8).

### El caso del rodeo por Google

Cuando la vuelta de OAuth trae el destino en la query (`?redirect_to=/curso/x`, contrato §7.2),
`readReturnPathFromSearch` lo saca de la URL ya validado, y `resolveReturnPath(search, fallback)`
resuelve en este orden: **query param → lo guardado → el fallback**. La query gana porque es el
dato más reciente: viene firmado dentro del `state` de OAuth de esta misma vuelta.

## `messages` — de la clave del backend al texto de la pantalla

El `422` del contrato (§5) trae `meta.fields` con claves de i18n **ya montadas por el backend**
(`{"email": "auth.errors.email_invalid"}`). No se pueden pasar a `t()` tal cual: las claves de este
repo están tipadas y `t(variable)` no compila (`03_` §11). `toAuthMessageKey` es el mapa explícito
backend → clave propia, y lo que no está en el mapa cae en `errors.validation_error`.

**La lista completa que manda el backend sigue sin documentar en el contrato**, que solo nombra
`auth.errors.email_invalid`. El mapa cubre esa y las quince `auth.validation.*` que corresponden a
campos que existen en los formularios; cuando el equipo de service publique la lista, se amplía
aquí y **solo** aquí.

## `auth_error_message` — los 12 `meta.code`, en un solo sitio

`AUTH_ERROR_MESSAGE_KEYS` es un `Record<ApiErrorCode, clave>`: si mañana el contrato añade un
código, `ApiErrorCode` crece y **TypeScript exige** la fila nueva. El fallo de red no tiene código
(`status === 0`) y se resuelve antes; un código que no esté en `API_ERROR_CODES` cae en
`errors.internal_error` si es 5xx y en `errors.unknown` si no.

## `google_authorize`

`buildGoogleAuthorizeUrl(redirectTo)` arma `GET /auth/google?redirect_to=…` (contrato §4, endpoint 9) y `startGoogleAuthorize()` salta ahí con el destino guardado. Vivía duplicado en login y en
registro; ahora es uno.
