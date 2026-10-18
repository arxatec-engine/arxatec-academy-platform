# Feature `oauth_callback` — `/oauth/callback?code=…&redirect_to=…`

Único path en inglés de la app: lo fija el proveedor (`03_` §8, invariante 2).

Es una **pantalla de paso**, no una pantalla con la que se interactúe: canjea el código de Google
por una sesión, la guarda y se aparta. Solo tiene dos estados visibles, carga y error, y ninguno
se entrega sin su acción.

| Cosa        | Dónde                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Ruta        | `ROUTES.oauth_callback` · `RouteHelpers.oauthCallback(code?)` · árbol `auth_routes`, **sin** `<Guest>` (`routes/auth_routes/index.tsx:38-41`) |
| Endpoint    | `POST /auth/google/exchange` (contrato §4, endpoint 11) con `axiosPublicInstance`                                                             |
| Query key   | `authKeys.googleExchange(code)` (`src/modules/auth/keys/index.ts:5`)                                                                          |
| Claves i18n | `auth.oauth_callback.*` y `auth.errors.*`                                                                                                     |

## El flujo, en orden

1. `hooks/use_oauth_exchange` lee `code` y `redirect_to` de la query con los nombres de
   `ROUTE_QUERY_PARAM_NAMES` (`hooks/use_oauth_exchange/index.ts:20-23`) y los valida con
   `oauthCallbackParamsSchema`.
2. `services/exchangeGoogleCode` hace el `POST` y devuelve `data.data`, que es la `ApiSession` del
   contrato §3. Si el sobre llega sin `data`, lanza un `ApiError 500 INTERNAL_ERROR` en vez de
   propagar `undefined` (`services/index.ts:19-27`), igual que hace `services/me`.
3. Con la sesión en mano el hook la guarda con `useUserStore.setSession(token, user, true)` y
   **siembra el perfil en la caché** de `authKeys.me()`, los dos en el mismo efecto
   (`hooks/use_oauth_exchange/index.ts:48-52`) — nunca contra `localStorage` a mano.
4. La página solo pinta `<Navigate to={target} replace />` cuando el usuario del store **ya es** el
   de la sesión recién canjeada (`isStored`, `hooks/use_oauth_exchange/index.ts:46`). Sin esa
   comprobación habría una carrera: los efectos de los hijos corren antes que los del padre, así
   que un `<Navigate>` pintado en el mismo commit que escribe la sesión navegaría **antes** de que
   la sesión existiera.

## Por qué se siembra `authKeys.me()`

`useAuth` (`hooks/use_auth/index.ts:30-34`) lee el perfil con `useQuery(authKeys.me())` y el
`QueryClient` tiene `staleTime` de 30 s (`utilities/query`). Quien entra por Google **sin recargar
la página** —sesión vieja caducada, botón "Continuar con Google", vuelta al callback— llega con el
perfil del usuario anterior todavía en caché, y el destino pintaría ese nombre hasta 30 s. Sembrar
con `session.user`, que es el perfil que **acaba** de devolver el servidor, lo corrige sin una
petición extra; invalidar habría costado un `GET /auth/me` de más para el mismo dato.

Lo cubre `__tests__/…/oauth_callback/pages/index.test.tsx` ("reemplaza el perfil cacheado del
usuario anterior"): quitando la línea `setQueryData` el test falla con el usuario viejo en caché.

## Por qué `useQuery` para un `POST`

El código **vive 60 s y es de un solo uso** (contrato §4, endpoints 9–11, y `08_decisiones.md`
D-005). Eso obliga a dos cosas que un `useMutation` disparado desde un `useEffect` no da, y que
además rompería la regla de `03_` §6 ("prohibido llamar a la API dentro de un `useEffect`"):

- **Arranca solo al montar**, que es lo que hace un `useQuery`.
- **Se pide exactamente una vez.** `retry: false` (un código quemado no se arregla reintentando) y
  `staleTime`/`gcTime` en `Infinity` con `refetchOnMount`/`refetchOnReconnect`/`refetchOnWindowFocus`
  en `false` (`hooks/use_oauth_exchange/index.ts:37-43`). El `gcTime` infinito es deliberado: si el
  usuario vuelve atrás a esta URL, la caché responde con la sesión ya canjeada en vez de disparar un
  segundo canje que fallaría.

**Medido en el navegador** con `StrictMode` activo (`main.tsx:14`), parcheando
`XMLHttpRequest.prototype.open` antes de entrar a la pantalla por navegación de cliente: **una sola
llamada** a `/auth/google/exchange`. El doble montaje de `StrictMode` no duplica el canje.

## La recarga: el caso que no puede dejar la pantalla girando

Recargar `/oauth/callback?code=…` reintenta el canje con un código ya consumido. El backend
responde `400 TOKEN_INVALID` (contrato §5), la query pasa a `isError` y el hook devuelve
`{ status: "error", reason: "failed" }` (`hooks/use_oauth_exchange/index.ts:65-67`). No hay un
`reason` propio para el código quemado: el motivo concreto lo pone el **texto**, que sale de
`authErrorMessage(error, t)` → `errors.token_invalid` ("Ese enlace ya no sirve: venció o alguien ya
lo usó"), y la pantalla pinta el botón a `/ingresar`. Es el único camino: la caché de React Query no
sobrevive a una recarga, así que aquí no hay atajo posible y lo correcto es contarlo, no girar.

Hay **dos** motivos de error, y el texto lo decide el traductor compartido del módulo:

| `reason`       | Cuándo                                                          | Texto                                                                      |
| -------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `missing_code` | la URL llega sin `code` (el rodeo por Google se cortó a medias) | `errors.unauthenticated`                                                   |
| `failed`       | el canje falló                                                  | `authErrorMessage(error, t)` (`src/modules/auth/utils/auth_error_message`) |

`authErrorMessage` cubre los 12 `meta.code` del contrato más el fallo de red (`status === 0`), y
cuando un `429` llega sin ningún tiempo de espera —ni `meta.retry_after_seconds` ni la cabecera
`Retry-After`, que el interceptor también lee (`src/interceptors/docs/README.md`)— usa
`errors.retry_later` en vez de decir "prueba de nuevo en 0 s". Las claves de i18n están tipadas y `t(variable)` no compila (`03_` §11):
por eso el mapa código → clave es un `Record<ApiErrorCode, …>` explícito.

## El destino de retorno

Prioridad: `redirect_to` de la query → lo que quedara en `sessionStorage` → el catálogo
(`hooks/use_oauth_exchange/index.ts:26-27`). El de la query es el que viaja firmado en el `state`
de OAuth y vuelve como query param (contrato §7, punto 2); el de `sessionStorage` cubre al usuario
que empezó el rodeo desde una lección.

Los dos pasan por `sanitizeRedirectPath`: el de la query dentro del schema
(`schemas/index.ts:12`), el guardado dentro de `readRedirectTo`
(`services/auth_storage/index.ts:95-98`). Un `redirect_to=https://malo.pe` cae a `null` y la
pantalla manda al catálogo — sin eso, el login es un redirector abierto y un clásico de phishing
(contrato §7, punto 1).

El destino guardado se lee **una sola vez** con `useState(readReturnPath)`
(`hooks/use_oauth_exchange/index.ts:18`) —`readReturnPath` es la puerta del módulo
(`@/modules/auth/utils/redirect_to`), no `readRedirectTo` de `@/services/auth_storage`— y no en cada
render. El efecto que lo borra corre en el
mismo commit que pinta el `<Navigate>`, y leerlo de nuevo entonces devolvería `null`: el usuario
acabaría en el catálogo en vez de en su lección.

## Decisiones que conviene conocer

- **`remember_me: true`.** El canje de Google no tiene casilla que marcar y el contrato §3 solo
  define dos comportamientos; se toma el mismo que el registro, que también devuelve la sesión ya
  iniciada con `remember_me: true` (contrato §4, endpoint 1). Token en `localStorage`, 30 días de
  inactividad. Cambiarlo es la constante `OAUTH_REMEMBER_ME` (`hooks/use_oauth_exchange/index.ts:14`).
- **Sin toast.** `05_` §5 reserva el toast para "sin conexión / 500" en pantallas **con formulario**,
  donde el error tiene que caber sin tapar lo escrito. Aquí la pantalla entera es el mensaje y ya
  lleva su acción al lado: un toast diría la misma frase dos veces, y el `<Toaster>` está en
  `visibleToasts={1}`.
- **El estado de carga también tiene salida.** El pie lleva `shared.back_to_login`: si el canje se
  queda colgado, el usuario no se queda encerrado mirando el skeleton.
- **Fuera de `<Guest>`**: se puede llegar aquí con una sesión vieja, y este flujo la sustituye.
  `<Guest>` rebotaría al usuario antes de canjear el código, que se perdería para siempre.
- **Dentro de `NO_RETURN_ROUTES`**: el interceptor ya incluye `ROUTES.oauth_callback` en esa lista
  (`interceptors/index.ts:18-23`), así que un 401 aquí nunca guarda esta URL como destino de retorno.
  Correcto: volver a una URL con un código quemado no lleva a ningún sitio.

## Estados y accesibilidad

| Estado                  | Qué se pinta                                                                                                                | Acción                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Carga                   | `oauth_callback.loading.*` + `role="status" aria-live="polite" aria-busy="true"` con el texto `shared.loading` en `sr-only` | pie "Volver a iniciar sesión"                  |
| Error (los dos motivos) | `oauth_callback.error.*` + detalle en `AuthFormError` (`role="alert"`)                                                      | botón `size="lg"` ancho completo a `/ingresar` |

No hay estado vacío distinto del de error: la URL sin `code` **es** el vacío de esta pantalla y se
pinta como `missing_code`, con la misma acción.

No hay formulario, así que no hay nada que vaciar tras un error: lo único que el usuario "escribió"
es el destino de retorno, y ese sobrevive al error porque sigue en la query y en `sessionStorage`
(solo se borra al navegar con éxito; lo fija el test "conserva el destino de retorno guardado
cuando el canje falla").

## Comprobado en el navegador

Con un backend de prueba de un solo archivo (canjea el código la primera vez y responde
`400 TOKEN_INVALID` a partir de la segunda) y con la API apuntada a una IP que no responde, para
poder mirar el estado de carga sin prisa:

- **Camino feliz**: `?code=…&redirect_to=/revisa-tu-correo` → token y usuario en `localStorage`
  (no en `sessionStorage`: `remember_me` es `true`), `sessionStorage.redirect_to` borrado, y la
  pantalla de destino —que va detrás del guard `<Auth>`— se pinta con el correo del usuario.
- **Recarga con el código quemado**: misma URL otra vez → `400 TOKEN_INVALID`, título "No pudimos
  entrar con Google", detalle "Ese enlace ya no sirve…", botón a `/ingresar` y **ningún**
  `role="status"` en la página. No se queda girando.
- **Sin backend**: `ApiError.status === 0` → detalle de `errors.network`, no de código caducado.
- **Tema claro y tema oscuro** en los dos estados; el fondo, la tarjeta y el error salen de los
  tokens (no hay ningún color a mano en la feature).
- **`es` / `en` / `pt`**: título, subtítulo, detalle y acción traducidos, sin claves crudas.
- **Teclado**: `Tab` llega al único elemento accionable de cada estado, `:focus-visible` da un
  anillo de 2 px del token `ring` (`oklch(0.708 0 0)`) y `Enter` sigue el enlace.
- **360 px** (medido en un iframe de 360 px de ancho): `scrollWidth === clientWidth` (356/356), sin
  scroll horizontal; la tarjeta mide 332 px.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
