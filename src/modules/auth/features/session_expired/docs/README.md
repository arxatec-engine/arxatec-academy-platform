# Feature `session_expired` — `/sesion-vencida`

Pantalla **E7** del tablero (`harness/05_diseno_y_ux.md` §4). Es la única pantalla del módulo
que **no pide nada al usuario**: le cuenta por qué se cerró la sesión y le da los dos caminos
que el brief nombra, "Iniciar sesión" y "Seguir sin cuenta".

| Cosa        | Dónde                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Ruta        | `ROUTES.session_expired` · `RouteHelpers.sessionExpired()` · árbol `error_routes`, **sin guard** |
| Endpoint    | `POST /auth/logout` (contrato §4, endpoint 3), y solo cuando queda algo que revocar              |
| Claves i18n | `auth.session_expired.*`, `auth.errors.*`                                                       |
| Página      | `pages/index.tsx` → `export default SessionExpiredPage`                                          |

## Cómo se llega aquí

Dos caminos, y los dos **guardan antes el destino de retorno**:

1. el interceptor ante un `401` con `meta.code: "SESSION_EXPIRED"`
   (`src/interceptors/index.ts:123`), que escribe `redirect_to` y navega;
2. el guard `<Auth>` cuando la query de `/auth/me` falla con ese código
   (`src/components/guards/auth/index.tsx:29`), que guarda el destino en su `useEffect`.

Por eso la pantalla **no consume** el destino: lo consume `<Guest>` cuando el usuario ya ha
entrado (`src/components/guards/guest/index.tsx:10`). Aquí solo se conserva o se olvida.

No lleva guard a propósito: quien llega ya no tiene sesión, y ponerle `<Auth>` lo mandaría a
`/ingresar` sin llegar a leer por qué se cerró.

## Qué hace cada botón

| Botón                 | Qué pasa                                            | Destino de retorno                                                          |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| **Iniciar sesión**    | cierra la sesión (ver abajo) y navega a `/ingresar` | **se conserva**: es la promesa del párrafo ("vuelves a esta misma lección") |
| **Seguir sin cuenta** | cierra la sesión y navega al catálogo               | **se olvida**                                                               |

El segundo caso es una decisión, no un olvido: si el usuario elige seguir sin cuenta, dejar
`redirect_to` en `sessionStorage` haría que un login posterior —quizá media hora después, desde
otra pantalla— lo teletransportase a una lección que ya abandonó. La lógica vive en
`hooks/use_session_close/index.ts:42`.

## Por qué el servicio de la feature no es el `POST` pelado

`services/index.ts` no llama a axios: llama a `logout()` (`src/modules/auth/services/logout`)
**solo si `readAuthToken()` devuelve algo**, y trata un `401` como éxito silencioso.

- El `POST /auth/logout` exige Bearer (contrato §4). Quien llega aquí por el camino normal ya
  no tiene token, porque el interceptor vació el almacenamiento al ver el 401 (`clearAuthSession()`
  en `src/interceptors/index.ts:116`). El guard `<Auth>`, en cambio, **no** limpia en este camino:
  borrar el usuario del store antes de redirigir dejaba `hasSession` en `false` y la propia
  redirección se convertía en `/ingresar`, así que esta pantalla no llegaba a verse (ver
  `src/components/guards/docs/README.md`). Pedir la revocación sin token sería un `401` garantizado
  en cada carga de la pantalla.
- Queda un caso real en el que sí hay token: alguien abre `/sesion-vencida` a mano con la
  sesión todavía viva. Ahí el `POST` **sí** revoca la sesión en la base de datos, que es lo que
  hace que "cerrar sesión" signifique algo (`harness/08_decisiones.md` D-004).
- Un `401` en esa llamada significa que la sesión ya estaba muerta: el objetivo se cumplió, así
  que se devuelve `{ revoked: false }` en vez de propagar un error que el usuario no puede
  arreglar.

**Trampa conocida:** si ese `401` llega con un token todavía en almacenamiento, el interceptor
lo ve antes que nosotros y hace `window.location.assign(RouteHelpers.sessionExpired())`
(`src/interceptors/index.ts:125`), o sea, recarga esta misma pantalla. No es un bucle —tras la
recarga ya no hay token y la siguiente pulsación no llama al servidor— pero explica un parpadeo
que de otro modo parecería un bug de esta feature.

## Los estados, cada uno con su acción

| Estado   | Qué se pinta                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Normal   | título, párrafo y los dos botones                                                                                                      |
| Cerrando | el botón pulsado con spinner y `aria-busy`, el otro deshabilitado (`components/session_expired_actions`)                               |
| Error    | toast con el mensaje traducido; los dos botones vuelven a estar activos                                                                  |
| "Vacío"  | no hay destino de retorno guardado: la pantalla es la misma y las dos acciones siguen siendo válidas                                   |

El error se notifica con un toast mientras las dos acciones siguen disponibles. El mensaje se elige por `meta.code` con `authErrorMessage`
(`src/modules/auth/utils/auth_error_message`), el mismo traductor que usan las otras seis
pantallas: un `Record<ApiErrorCode, clave>` explícito, porque las claves de i18n están tipadas y
`t(variable)` no compila.

Pase lo que pase con la red, el estado local **siempre** queda limpio: `onSettled` borra el
usuario del store (y con él el almacenamiento) y vacía la caché de React Query
(`hooks/use_session_close/index.ts:39`). Solo la navegación espera al `onSuccess`.

## `schemas/` sin formulario

Esta pantalla no tiene campos, pero sí una entrada que no controlamos: `?redirect_to=…` en la
URL, que es como vuelve el destino del rodeo por Google (contrato §7.2). `returnPathSchema` es
la puerta de zod para ese valor, con el mensaje guardado como **clave de i18n**
(`RETURN_PATH_ERROR_KEY`) y no como texto. `hooks/use_return_path` lo valida y lo persiste con
el helper del módulo; si no pasa, se descarta en silencio y se usa el que ya hubiera guardado.

## Mapa de archivos

```text
session_expired/
├─ components/session_expired_actions/   los dos botones, spinner y aria-busy
├─ components/session_expired_error/     alerta con el mensaje traducido
├─ hooks/use_return_path/                ?redirect_to= → sessionStorage (validado)
├─ hooks/use_session_close/              useMutation: revoca, limpia, navega
├─ schemas/                              zod del destino de retorno
├─ services/                             cuándo se llama a POST /auth/logout
├─ types/                                SessionCloseTarget y el resultado
└─ pages/index.tsx                       export default
```

Tests en `src/__tests__/modules/auth/features/session_expired/`.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
