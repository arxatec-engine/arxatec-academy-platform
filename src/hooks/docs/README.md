# `src/hooks` — transversales

Solo entra aquí lo que cruza dominios. Lo que usa una sola feature vive en `features/<f>/hooks/`.

| Hook           | Qué hace                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `use_auth`     | `useQuery` de `GET /auth/me`. Devuelve el usuario ya adaptado a `UserUI`, `hasSession`, `isPending`, `isError`, `isSessionExpired` y el `error`. |
| `use_darkmode` | Modo de tema, tema resuelto y `setMode`. Escucha `prefers-color-scheme` en vivo.                                                                          |
| `use_language` | Idioma activo, la lista de idiomas y `changeLanguage`.                                                                                                    |

## `useAuth`

`enabled` cuelga de que haya usuario en el store, no de leer el token en el render: el store es
reactivo (un login lo actualiza sin recargar) y leer `localStorage` en el cuerpo del componente es
exactamente el tipo de lectura que el React Compiler puede memoizar por sorpresa.

Cuando `/auth/me` responde, un `useEffect` refresca el store (`use_auth/index.ts:38`). No es una
llamada a la API dentro de un `useEffect` —eso está prohibido y la llamada la hace `useQuery`—,
es sincronizar dos fuentes: el usuario cacheado en el almacenamiento y el que acaba de llegar. Sin
esto, un `email_verified_at` recién puesto no se vería hasta la siguiente recarga.

Un `500` o una red caída conservan la sesión válida. El guard muestra el mensaje de error y
un enlace al catálogo.

El hook **no** cierra sesión ni redirige: eso es del guard `<Auth>` y, ante un 401, del interceptor.

## `useDarkMode`

El `useEffect` reaplica el tema en cada cambio de modo y solo se suscribe a `matchMedia` cuando el
modo es `system`. `matchColorScheme()` devuelve `null` si no hay `window.matchMedia`, que es lo que
hace el hook seguro en un entorno sin DOM.

## `useLanguage`

`i18n.resolvedLanguage` pasa por `toLanguage()`, que recorta la región (`es-ES` → `es`): el
selector compara contra los tres códigos base y sin el recorte ninguno saldría marcado en un
navegador con idioma regional.
