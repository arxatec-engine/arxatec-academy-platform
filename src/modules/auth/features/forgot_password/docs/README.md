# Feature `forgot_password` — `/recuperar-contrasena`

Pantalla 06 del tablero (`harness/05_diseno_y_ux.md` §4). Un solo campo (correo) y un botón
("Enviar el enlace"); al enviar, la pantalla cambia a un estado de confirmación que **no dice si
el correo existe**.

| Cosa | Dónde |
| --- | --- |
| Ruta | `ROUTES.forgot_password` · `RouteHelpers.forgotPassword()` · registrada en `src/routes/auth_routes/index.tsx:25` bajo `<Guest>` |
| Endpoint | `POST /auth/password/forgot` (`src/modules/auth/constants/index.ts:6`) con `axiosPublicInstance` |
| Claves i18n | `auth:forgot_password.*` (incluida la sección `sent`), `auth:shared.fields.email.*`, `auth:validation.*`, `auth:errors.*` |
| Página | `pages/index.tsx`, `export default` (lo exige `lazyPage`) |

## 1. El flujo

```text
ForgotPasswordPage (pages/index.tsx)
├─ isSent === false → <ForgotPasswordForm defaultEmail autoFocus onSent />
│                       └─ useForgotPassword() → requestPasswordReset() → POST /auth/password/forgot
└─ isSent === true  → <ForgotPasswordSent onResend />
```

La página es la única que guarda el estado de la pantalla (`pages/index.tsx:7-8`): el formulario no
sabe que existe la confirmación y la confirmación no sabe que existe el formulario. Por eso
"Enviar otro enlace" es un `setIsSent(false)` (`pages/index.tsx:15-17`) y no una segunda petición
disparada a ciegas: el usuario vuelve al formulario, ve el correo que escribió y decide.

## 2. Por qué la confirmación no confirma nada

El contrato responde `200` **exista o no la cuenta**, con el mismo texto y el mismo tiempo
(`harness/04_contrato_api_auth.md` §4, endpoint 5; `harness/01_reglas_globales.md` §8.2). Si la
pantalla ramificara por la respuesta —o pintara el correo escrito, o dijera "te mandamos el enlace
a maria@…"— convertiría `/recuperar-contrasena` en el oráculo de correos registrados que el login
evita a propósito con su `INVALID_CREDENTIALS` único.

Consecuencias que están en el código y conviene no "arreglar":

1. `requestPasswordReset` devuelve `void` (`services/index.ts:10`): no hay nada en `data` que mirar,
   y no haberlo tipado deja sin sitio donde colgar una rama por respuesta.
2. `ForgotPasswordSent` **no recibe el correo**. El texto es el literal del brief ("Si esa cuenta
   existe, el enlace ya va en camino"), sin interpolación. Hay un test que comprueba que el correo
   escrito no aparece en la confirmación
   (`src/__tests__/modules/auth/features/forgot_password/pages/index.test.tsx:82`).

## 3. El destino de retorno viaja con la petición

`useForgotPassword` lee `readRedirectTo()` dentro del `mutationFn`
(`hooks/use_forgot_password/index.ts:11`), no en el render: si el usuario llegó desde una lección,
el backend firma ese destino en el enlace del correo y el reset devuelve a la lección
(contrato §7). Se lee de `@/services/auth_storage`, que ya lo pasa por `sanitizeRedirectPath`; la
feature no toca `sessionStorage` ni valida paths por su cuenta.

El servicio traduce a `snake_case` en un solo sitio (`services/index.ts:7-8`) y **omite el campo
cuando no hay destino**: `redirect_to: null` no es lo mismo que no mandarlo, y el contrato lo marca
como opcional.

## 4. Errores: qué se pinta dónde

El hook no pinta nada (no hay invalidación que hacer: esto no cachea nada); el componente decide el
feedback (`03_reglas_frontend.md` §6). El reparto está en `components/forgot_password_form/index.tsx:63-93`
y sigue la tabla de `05_diseno_y_ux.md` §5:

| Caso | `meta.code` | Qué se pinta |
| --- | --- | --- |
| Campo vacío o correo mal escrito | — (Zod, antes de salir) | error bajo el campo, `aria-invalid`, foco al campo |
| `422` con `fields.email` | `VALIDATION_ERROR` | error **en el campo correo** (`:81-83`) |
| `422` sin campo reconocible | `VALIDATION_ERROR` | error bajo el formulario con `role="alert"` (`:82`) |
| `429` | `RATE_LIMITED` | toast con los segundos de `retry_after_seconds` (`:74-78`) |
| `500` / `INTERNAL_ERROR` | `INTERNAL_ERROR` | toast genérico (`:87-90`) |
| Sin respuesta (status 0) | — | toast de "sin conexión" (`:69-72`) |

Dos detalles medidos, no de estilo:

- **`meta.fields` trae claves del backend ya montadas** (`"email": "auth.errors.email_invalid"`), y
  las claves de i18n de este repo son tipadas: `t(variable)` no compila. Por eso hay un mapa
  explícito backend → clave propia, compartido por todo el módulo en
  `src/modules/auth/utils/messages` (`toAuthMessageKey`), y lo que no está en el mapa cae a
  `errors.validation_error` en vez de pintar una clave cruda en pantalla. Un `422` que ni siquiera
  nombre el campo `email` se pinta como error global bajo el formulario.
- **El formulario nunca se vacía tras un error.** `react-hook-form` conserva los valores y ninguna
  rama de `reportFailure` llama a `reset()`; hay tests que lo comprueban en el 422, en el 500 y en
  el fallo de red.

## 5. Teclado y lectores de pantalla

- El `<form>` va con `noValidate` (`:116`): la validación es la de Zod, en los tres idiomas, no la
  burbuja del navegador en el idioma del sistema.
- `AuthField` enlaza `htmlFor`/`id`, `aria-invalid` y `aria-describedby`; el `role="alert"` del
  error lo anuncia sin mover el foco.
- Al fallar la validación, `handleSubmit` lleva el foco al campo con error (comportamiento por
  defecto de `react-hook-form`, comprobado en el navegador).
- **Al pasar a la confirmación el foco se movería al `<body>`**, porque el botón que se acaba de
  pulsar desaparece del DOM: un usuario de teclado tendría que tabular desde el principio del
  documento para llegar a las acciones nuevas. Por eso `ForgotPasswordSent` envuelve la tarjeta en
  un contenedor `tabIndex={-1}` y lo enfoca al montar
  (`components/forgot_password_sent/index.tsx:19-27`); ese foco es además lo que hace que el lector
  de pantalla lea el nuevo título.
- Al volver al formulario con "Enviar otro enlace", el campo recupera el foco porque la página pasa
  `autoFocus` solo cuando ya hay correo escrito (`pages/index.tsx:24`). En la primera carga no se
  roba el foco ni se abre el teclado del móvil sin pedirlo.

## 6. Comprobado a mano (gates de `07_gates.md`)

Con `pnpm dev --port 5241` y un servidor de respuestas del contrato en `:3099`
(`VITE_API_URL=http://localhost:3099/api/v1`):

- Tema **claro** y **oscuro**: fondo, tarjeta, botón principal y el rojo del error salen de los
  tokens; no hay ni un color fijo en la feature.
- Teclado solo: `Tab` llega a campo, botón y enlace; `Enter` desde el campo envía; el foco se ve.
- `es` / `en` / `pt`: formulario y confirmación, sin claves crudas.
- Estados: carga (botón con spinner, `disabled`, `aria-busy`), error de campo, error global, fallo
  de red (toast + formulario intacto) y confirmación con sus dos acciones.
- 360 px: sin desbordamiento horizontal (`scrollWidth === clientWidth === 360`).
