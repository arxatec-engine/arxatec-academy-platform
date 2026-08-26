# Guards: `<Auth>` y `<Guest>`

Los dos son **route elements** que pintan `<Outlet/>` o redirigen; van *eager* (regla
`harness/03_reglas_frontend.md` §8) y por eso no importan barriles pesados.

## `<Guest>`

Protege las pantallas de auth de quien ya tiene sesión. Si `useUserStore` tiene usuario, manda al
destino de retorno guardado (`readReturnPath()`, la puerta del módulo en
`@/modules/auth/utils/redirect_to`) y, si no hay, al catálogo. El `clearRedirectTo()`
va en un `useEffect` (`guest/index.tsx:13`) y no en el render: la lectura es pura, el borrado no.

Solo cuelgan de `<Guest>` login, registro y recuperación. **Reset, verificación y el callback de
Google quedan fuera a propósito**: son flujos que consumen un token del correo y tienen que
funcionar aunque el usuario tenga sesión abierta.

## `<Auth>`

1. Sin usuario en el store → guarda el destino de retorno, limpia y a `/ingresar`.
2. Con usuario → `useAuth()` (`GET /auth/me`) y mientras tanto splash.
3. `401 SESSION_EXPIRED` → pantalla E7 conservando el destino de retorno.
4. `401 UNAUTHENTICATED` (o un 401 sin código) → limpia y a `/ingresar`.
5. **Cualquier otro fallo** (500, 502, red caída, `status === 0`) → `ErrorScreen` con "Volver a
   intentarlo", que dispara el `retry` de `useAuth`. **La sesión se queda donde está.**

Es una **segunda línea**, no la única: el interceptor sigue siendo el único sitio que cierra sesión
ante un 401 (`src/interceptors/index.ts:113`). El guard cubre el caso de un token que ya no vale
cuando la primera petición de la pantalla es justamente `/auth/me`.

## Por qué el guard distingue "no hay sesión" de "la petición falló"

`auth/index.tsx:17` pregunta por `isSessionClosingError` (`src/interceptors/api_error/index.ts:32`),
no por `isError` a secas. Ramificar por `isError` borraba el token y el usuario ante **cualquier**
fallo de `GET /auth/me`: `shouldRetryRequest` reintenta dos veces un `500` (no es 4xx,
`src/utilities/query/index.ts:8`), la query pasa a `isError` y el efecto llamaba a `clearUser()`,
que ejecuta `clearAuthSession()` y vacía `TOKEN_AUTH` y `USER_AUTH` de los dos almacenamientos. Un
backend caído medio minuto expulsaba a un usuario con una sesión de 30 días perfectamente viva, y
tenía que volver a escribir la contraseña. Contradice además `harness/03_reglas_frontend.md` §5.2:
el interceptor es *el único sitio del código que cierra sesión*, y solo ante un 401 con
`UNAUTHENTICATED` / `SESSION_EXPIRED`. El guard usa exactamente esa misma regla —
`closesSession(status, code)` (`src/constants/api_error_codes/index.ts:34`)—, así que los dos lados
no pueden divergir. Cubierto en `src/__tests__/components/guards/auth/index.test.tsx` (500, red
caída, `SESSION_EXPIRED` y `UNAUTHENTICATED`).

## Por qué `SESSION_EXPIRED` **no** limpia el store aquí

`keepsUser` (`auth/index.tsx:18`) deja el usuario en el store cuando el motivo es
`SESSION_EXPIRED`. El orden de los efectos lo obliga: `clearUser()` deja `hasSession` en `false` y
la siguiente pasada del guard entra por la rama 1, que redirige a `/ingresar`, así que la pantalla
E7 no llegaba a verse nunca — el usuario se comía un login pelado en vez del texto que explica que
la sesión venció (contrato §5). Quien limpia es la propia pantalla E7, en el `onSettled` de su
mutación (`src/modules/auth/features/session_expired/hooks/use_session_close/index.ts:37`), y el
almacenamiento ya lo vació el interceptor al ver el 401.

## Trampa medida: React Query pausa los reintentos en pestañas ocultas

Con `networkMode: "online"`, React Query **pausa** el reintento cuando `focusManager.isFocused()`
es `false`. Verificado en el navegador: con la pestaña en `visibilityState: "hidden"` el estado de
la query se queda en `{ status: "pending", fetchStatus: "paused" }` y `<Auth>` se queda en el
splash indefinidamente; al forzar `focusManager.setFocused(true)` la query falla y el guard resuelve
en menos de un segundo (a E7, a login o al `ErrorScreen`, según el motivo). **No es un bug del guard**: es el comportamiento de
React Query y solo se ve en pestañas de fondo o en automatización. Antes de perseguir un splash
eterno, comprueba `document.hasFocus()`.
