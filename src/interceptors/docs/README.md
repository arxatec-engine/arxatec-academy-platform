# `src/interceptors` — la capa HTTP

Aquí viven **las dos únicas instancias de axios del proyecto** y **el único sitio que cierra
sesión**. Todo lo demás (servicios de feature, hooks de React Query) las consume; nadie crea una
tercera y nadie llama a `fetch`.

| Export | Qué es | Cuándo se usa |
| --- | --- | --- |
| `axiosInstance` (`index.ts:30`) | instancia autenticada | todo endpoint con `Bearer` |
| `axiosPublicInstance` (`index.ts:31`) | instancia sin token | login, registro, forgot, reset, verify, exchange |
| `ApiError` (`api_error/index.ts:11`) | el error normalizado | `catch` de servicios y hooks |
| `isApiError`, `isClientError` (`api_error/index.ts:27-30`) | guardas | ramificación y política de reintentos |
| `isSessionClosingError` (`api_error/index.ts:32`) | guarda del 401 que cierra sesión | el guard `<Auth>`, para no confundir un 500 con una sesión muerta |
| `resetSessionCloseGuard` (`index.ts:166`) | reinicia el cerrojo de cierre único | solo tests |

## Por qué el token se lee en cada petición y no al arrancar

`attachAuthorization` (`index.ts:132`) llama a `readAuthToken()` **dentro** del interceptor de
request, no al crear la instancia. Si el token se leyera al arrancar, un login o un logout
dejarían la instancia con el valor viejo y haría falta recargar la página para que la siguiente
petición saliera bien. Es el mismo motivo por el que borra la cabecera cuando no hay token
(`index.ts:135`): una instancia que conserva un `Authorization` obsoleto es peor que una sin él.

## Por qué se leen dos almacenamientos

El contrato (`harness/04_contrato_api_auth.md` §3) guarda el token en `localStorage` cuando
`remember_me` es `true` y en `sessionStorage` cuando es `false`. El interceptor no sabe cuál eligió
el usuario: delega en `readAuthToken` (`src/services/auth_storage/index.ts:69`), que mira los dos
en orden. Ese módulo es el único que toca el almacenamiento; el interceptor no escribe claves a
mano.

## Por qué el 401 solo cierra sesión en la instancia autenticada

`normalizeError` recibe una bandera (`index.ts:139`) y solo `axiosInstance` la pasa en `true`
(`index.ts:156-164`). Sin esa separación, un `401 INVALID_CREDENTIALS` — que es la respuesta
**normal** de un login con contraseña equivocada (contrato §5) — borraría la sesión del usuario y
lo mandaría a la pantalla de login desde la propia pantalla de login.

Dentro de la instancia autenticada el cierre se limita a los códigos de
`SESSION_CLOSING_ERROR_CODES` (`src/constants/api_error_codes/index.ts:24`) más el 401 sin código,
comprobado en `closesSession` (`src/constants/api_error_codes/index.ts:34`), que se llama desde
`normalizeError` (`index.ts:147`). Esa regla vive en `constants/` y no aquí porque el guard `<Auth>`
necesita **la misma**: si cada lado escribiera la suya, una sesión válida se cerraría en un sitio y
no en el otro (ver `src/components/guards/docs/README.md`).

## Por qué el cierre pasa una sola vez y solo si había token

`closeSessionOnce` (`index.ts:113`) guarda si había token **antes** de limpiar y usa el cerrojo de
módulo `hasClosedSession` (`index.ts:111`). Sin el cerrojo, diez queries en vuelo al caducar la
sesión disparan diez `location.assign` y el navegador registra diez entradas de historial. Sin la
comprobación del token, un 401 de un endpoint que nunca estuvo autenticado echaría a la calle a un
visitante anónimo.

## SESSION_EXPIRED y UNAUTHENTICATED no llevan al mismo sitio

| `meta.code` | Destino | Por qué |
| --- | --- | --- |
| `SESSION_EXPIRED` | `RouteHelpers.sessionExpired()` (pantalla E7) | el brief promete volver "a esta misma lección": antes de redirigir se guarda el destino de retorno con `writeRedirectTo` (`index.ts:124`) |
| `UNAUTHENTICATED` o 401 sin código | `RouteHelpers.login()` | no hay sesión que recuperar |

El destino de retorno **no** se guarda si el usuario ya estaba en una pantalla de auth
(`NO_RETURN_ROUTES`, `index.ts:18`): volver a `/ingresar` después de iniciar sesión es un bucle.
Los paths salen siempre de `RouteHelpers` (`src/routes/routes.ts`), nunca escritos a mano.

## Por qué el error se normaliza y por qué contempla `Blob`

`toDetails` (`index.ts:87`) lee `description`, `meta.code`, `meta.fields` y
`meta.retry_after_seconds` del sobre fijo del backend (contrato §1 y §5) y construye un `ApiError`.
La UI ramifica **solo por `code`**: `description` es texto para humanos y cambia con el idioma, así
que compararlo es un bug esperando a la primera traducción.

`resolvePayload` (`index.ts:81`) parsea el cuerpo antes de rendirse en dos casos reales: cuando la
petición pidió `responseType: "blob"` (una descarga que falla devuelve el JSON de error **dentro**
de un `Blob`) y cuando el cuerpo llega como string sin parsear. Sin esto el usuario ve
"network_error" en lugar del motivo real.

`ApiErrorDetails` está en `camelCase` (`api_error/index.ts:3`) porque es un objeto del frontend; el
`snake_case` del backend solo sobrevive en los tipos `Api*` de `src/types`.

## De dónde sale `retryAfterSeconds`: primero el sobre, luego la cabecera

El contrato promete el tiempo de espera por dos caminos distintos y el interceptor lee **los dos**
(`index.ts:100-102`):

| Código | Dónde viene el número | Quién lo pinta |
| --- | --- | --- |
| `429 RESEND_COOLDOWN` | `meta.retry_after_seconds` del sobre (contrato §4, endpoint 8) | la cuenta atrás de la pantalla 07 |
| `429 RATE_LIMITED` | cabecera **`Retry-After`** (contrato §6) | el toast de `authErrorMessage` |

Leer solo `meta` dejaba `retryAfterSeconds` en `null` para `RATE_LIMITED`, y el toast caía siempre
en `errors.retry_later` ("Espera un momento y vuelve a intentarlo") aunque el servidor estuviera
diciendo el número exacto: quien agota los 10 intentos de login en 15 minutos no llegaba a saber
cuánto tiene que esperar, y la clave `errors.rate_limited` con `{{seconds}}` —que existe en los
tres idiomas— era inalcanzable para ese código.

`readHeader` (`index.ts:50`) busca sin distinguir mayúsculas, porque `AxiosHeaders` normaliza a
minúsculas pero un mock o un `adapter` de test puede pasar el nombre tal cual. `parseRetryAfter`
(`index.ts:60`) acepta los **dos** formatos que permite el RFC: segundos (`Retry-After: 120`) y
fecha HTTP, que se convierte a los segundos que falten. El sobre gana a la cabecera cuando trae las
dos cosas: es el dato que el backend calculó para esa cuenta, no para esa IP.

> **Depende del backend, y es un cambio de los dos lados.** `Retry-After` **no** es una cabecera
> CORS-safelisted: si el backend no la publica en `Access-Control-Expose-Headers`, el navegador se
> la come y el frontend no la ve —aunque en `curl` esté—. El frontend ya está listo; el backend
> tiene que exponerla (anotado en `harness/registro/2026-08-20/CORRECCION_REVISION_LOGIN.md`).
> Mientras no lo esté, el comportamiento es el de antes: `errors.retry_later`, sin número inventado.

## Lo que este módulo NO hace

- No muestra toasts ni conoce React: eso es del componente (`harness/03_reglas_frontend.md` §6).
- No reintenta: la política de reintentos vive en `src/utilities/query`.
- No guarda la sesión al iniciarla: eso es `writeAuthSession`
  (`src/services/auth_storage/index.ts:76`), llamado desde el store de usuario.
