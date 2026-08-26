# Feature `verify_email` — dos pantallas de un mismo flujo

Una sola feature cubre las **dos** rutas de la verificación de correo, porque comparten el
endpoint de reenvío, los estados y la tarjeta:

| Ruta | Página | Guard | Endpoint |
| --- | --- | --- | --- |
| `/revisa-tu-correo` (pantalla 07 del tablero) | `pages/check_email/index.tsx` | `<Auth>` | `POST /auth/email/resend` (Bearer) |
| `/verificar-correo?token=…` (destino del enlace) | `pages/index.tsx` | sin guard | `POST /auth/email/verify` (pública) |

Registro en el árbol (lo hace el integrador):

```ts
{ path: ROUTES.check_email,  element: lazyPage(() => import("@/modules/auth/features/verify_email/pages/check_email")) }
{ path: ROUTES.verify_email, element: lazyPage(() => import("@/modules/auth/features/verify_email/pages")) }
```

Ya está así en el árbol: `src/routes/app_routes/index.tsx:22` apunta a
`features/verify_email/pages/check_email` y la carpeta puente `features/check_email` se borró en la
integración.

## Por qué cada instancia de axios

`verifyEmail` usa `axiosPublicInstance` (`services/index.ts:10`) y `resendVerificationEmail` usa
`axiosInstance` (`services/index.ts:16`). No es simetría rota: el contrato marca el endpoint 7
como público y el 8 como Bearer (`harness/04_contrato_api_auth.md` §4). Y hay una segunda razón
que se ve en runtime: quien abre el enlace del correo puede tener una sesión caducada en el
navegador; con la instancia autenticada, el `401` lo interceptaría el cierre de sesión
(`src/interceptors/index.ts:147`) y el usuario acabaría en la pantalla E7 en vez de ver su correo
verificado.

## `EMAIL_ALREADY_VERIFIED` no es un error

El endpoint es idempotente: un correo ya verificado responde **200** con
`meta.code: "EMAIL_ALREADY_VERIFIED"`. Por eso ese código vive en `API_SUCCESS_CODES` y no en
`API_ERROR_CODES` (`src/constants/api_error_codes/index.ts:18`), el servicio lo traduce a un
booleano de dominio (`services/index.ts:12`) y el hook lo pinta como estado `already`
(`hooks/use_verify_email/index.ts:52`). Quien hace clic dos veces en el enlace del correo **no
puede ver un fallo**: no hizo nada mal.

## Estados de `/verificar-correo`

`hooks/use_verify_email/index.ts:48` resuelve seis estados y `pages/index.tsx:62` les pone
icono, texto y **acción** — ningún estado se entrega sin la suya (`harness/05_diseno_y_ux.md` §5):

| Estado | Cuándo | Acción al lado (con sesión) | Acción al lado (sin sesión) |
| --- | --- | --- | --- |
| `loading` | la petición está en vuelo | — (spinner + `aria-busy`) | ídem |
| `success` | 200 sin `meta.code` | Ir al catálogo | ídem |
| `already` | 200 con `EMAIL_ALREADY_VERIFIED` | Ir al catálogo | ídem |
| `expired` | `400 TOKEN_INVALID` (`hooks/use_verify_email/index.ts:52`) | Reenviar el enlace → `/revisa-tu-correo` | Iniciar sesión → `/ingresar` |
| `missing_token` | la URL llegó sin `?token=` o recortada | Reenviar el enlace → `/revisa-tu-correo` | Iniciar sesión → `/ingresar` |
| `failed` | red caída, 500, cualquier otro código | Volver a intentarlo (`refetch`) | ídem |

### Por qué la acción cambia cuando no hay sesión

`/revisa-tu-correo` cuelga del guard `<Auth>` (`src/routes/app_routes/index.tsx:15`) porque el
reenvío exige Bearer (contrato §4, endpoint 8). Este enlace, en cambio, se abre **desde el correo**,
que es muy a menudo otro navegador u otro dispositivo: ahí no hay sesión, y mandar a
`/revisa-tu-correo` era un callejón sin salida — el guard rebotaba a `/ingresar` con `replace`, sin
una línea que explicara el salto y sin botón de volver. Por eso la pantalla mira el store
(`selectIsAuthenticated`, `pages/index.tsx:38`) y, sin sesión, ofrece **Iniciar sesión** con su
propio texto (`auth.verify_email.*.signed_out.*`), dejando antes `/revisa-tu-correo` como destino de
retorno (`rememberReturnPath`, `pages/index.tsx:50-52`): tras entrar, el usuario cae justo en la
pantalla que reenvía el enlace. Lo fija el test de integración "el enlace caducado de verificación
no deja tirado a quien no tiene sesión" (`src/__tests__/routes/router/index.test.tsx`), que recorre
el camino entero hasta la pantalla 07.

La llamada va en un **`useQuery`** disparado por el montaje, no en un `useEffect` con axios
dentro (`03_` §6). Con `staleTime: Infinity` (`hooks/use_verify_email/index.ts:33`) y el token en
la query key, volver a la pestaña no reenvía el POST. Sin token, `skipToken`
(`hooks/use_verify_email/index.ts:31`) impide que la petición salga siquiera.

Tras verificar, el hook invalida `authKeys.me()` (`hooks/use_verify_email/index.ts:41`): el
usuario que ya tenía sesión abierta debe dejar de ver "sin verificar" sin recargar. **El hook
decide la invalidación; el componente decide el feedback** (`03_` §6).

## La cuenta atrás sale del servidor, nunca del cliente

La constante `AUTH_RESEND_COOLDOWN_SECONDS` (45) se borró en la integración: nadie la usaba y
tenerla invitaba a pintar una cuenta atrás inventada. El número que se pinta sale siempre de la
respuesta:

- `200` → `data.retry_after_seconds` (`services/index.ts:19`), validado con Zod; si el sobre no
  lo trae, se devuelve `null` y **no se inventa un 45** — el botón se queda listo y, si el
  servidor sigue en cooldown, el `429` lo corrige.
- `429 RESEND_COOLDOWN` → `meta.retry_after_seconds`, que el interceptor ya expone como
  `ApiError.retryAfterSeconds` (`src/interceptors/index.ts:100-102`) y el hook usa para
  **reiniciar** el contador (`hooks/use_resend_verification_email/index.ts:37`). Ese mismo campo
  recoge la cabecera `Retry-After` del `429 RATE_LIMITED` (contrato §6), que es el otro tope de este
  endpoint: 5 reenvíos por hora.

Corolario que se ve al llegar de `/crear-cuenta`: el botón arranca en "Reenviar el enlace", no en
"Reenviar en 45 s", porque en ese momento el cliente no tiene ningún número del servidor. El
primer clic puede responder `429`, y ahí sí aparece la cuenta atrás con los segundos reales que
faltan. Pintar 45 de entrada sería adivinar, y adivinaría mal en cuanto el usuario recargue la
pantalla a los 40 segundos.

`useCountdown` cuenta contra una **marca de tiempo**, no restando uno por segundo
(`hooks/use_countdown/index.ts:6`). Con un `setTimeout` encadenado, una pestaña dormida o un
navegador que estrangula temporizadores en segundo plano deja el contador atrasado y el botón
bloqueado de más; calculando `deadline - Date.now()` en cada tick, el número siempre es el que
falta de verdad y llega a 0 aunque se pierdan ticks.

## Accesibilidad y teclado

- El botón de reenvío usa `aria-disabled` y no `disabled`
  (`components/resend_verification_button/index.tsx:36`): un botón deshabilitado de verdad pierde
  el foco al bloquearse y el teclado se queda huérfano a mitad de la pantalla. El clic se corta
  en el hook (`hooks/use_resend_verification_email/index.ts:51`), no en el DOM.
- La región viva es **opcional** en la tarjeta (`components/verification_state_card/index.tsx:31`)
  y solo la enciende `/verificar-correo` (`pages/index.tsx:136`), que es donde el contenido cambia
  solo. En la pantalla 07 sería una trampa: la etiqueta del botón cambia **cada segundo** y un
  lector de pantalla la repetiría 45 veces.
- El correo en negrita se pinta partiendo el texto ya traducido por el propio correo
  (`components/highlighted_email/index.tsx`), en vez de meter `<strong>` dentro del JSON de i18n.
  Funciona porque `interpolation.escapeValue` está en `false` (`src/locales/i18n.ts:26`): el valor
  entra crudo y el `split` lo encuentra tal cual.

## Textos

Los literales son los del tablero (`harness/05_diseno_y_ux.md` §4, pantalla 07) y viven en
`auth.check_email.*` y `auth.verify_email.*` de los **tres** JSON. Las claves de error compartidas
se traducen en `utils/auth_error_message/index.ts`, que ramifica por `meta.code` y nunca por
`description` (§1 del contrato: `description` cambia con el idioma).

## Comprobación manual (07 · gates)

Hecha en Chrome contra `pnpm dev` con un stub local de la API (el backend real todavía responde
`404 NOT_FOUND` en `/auth/*`), sesión sembrada en `localStorage` para pasar el guard `<Auth>`:

| Gate | Resultado |
| --- | --- |
| Tema claro y oscuro | las dos pantallas correctas en ambos; ningún color fuera de los tokens |
| Teclado | `Tab` llega a los dos botones, `Enter` dispara el reenvío y el foco (anillo de 3 px) **se queda** en el botón al bloquearse |
| es · en · pt | las dos pantallas traducidas enteras, sin claves crudas; el correo sigue en negrita en los tres |
| Estados | `success`, `already`, `expired` y `missing_token` pintados con su acción; el `429` reinicia la cuenta atrás |
| 360 px | sin scroll horizontal (`scrollWidth === clientWidth`), la tarjeta baja a ancho completo |

Medido en el registro de red: tres clics seguidos en "Reenviar" durante la cuenta atrás producen
**un solo** `POST /auth/email/resend`.

## La cuenta atrás arranca al llegar desde el registro

La pantalla 07 del brief pinta el botón como **«Reenviar en 45 s»**, no como «Reenviar el
enlace»: quien acaba de registrarse ya tiene un correo en camino, y ofrecerle un botón activo
solo consigue que lo pulse y reciba un `429`.

Cómo se resuelve, en cuatro piezas:

| Pieza | Qué hace |
| --- | --- |
| `register_form/index.tsx` | navega con `state: { [CHECK_EMAIL_STATE_KEY]: true }` |
| `pages/check_email/index.tsx` | lee ese estado y pasa `initialCooldownSeconds` |
| `hooks/use_resend_verification_email` | arranca la cuenta atrás **una sola vez**, con un `useRef` de guarda |
| `constants/index.ts` | `AUTH_RESEND_COOLDOWN_SECONDS = 45` |

**Por qué el estado de navegación y no arrancar siempre al montar.** Si la cuenta atrás
arrancara en cada montaje, un usuario que vuelve a `/revisa-tu-correo` media hora después se
encontraría el botón bloqueado 45 segundos sin motivo. El estado de navegación solo existe en
el salto que viene del registro, y **se pierde al recargar** — que es exactamente el
comportamiento correcto.

**Quién manda sobre el número.** El backend, siempre. El 45 del frontend es solo el arranque
optimista del contador; en cuanto hay una respuesta real (`data.retry_after_seconds` en el
`200`, o `meta.retry_after_seconds` en el `429`), esa gana. Si algún día el backend cambia su
cooldown, lo peor que pasa aquí es que el primer contador se vea corto o largo durante un
único ciclo.

Guardado por dos tests en
`src/__tests__/modules/auth/features/verify_email/pages/check_email/index.test.tsx`: uno
comprueba que con el estado de navegación el botón nace en «Reenviar en 45 s» **sin llamar a la
API**, y el otro que entrando directo a la ruta el botón está disponible.
