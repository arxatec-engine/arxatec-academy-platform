# Feature `reset_password` — `/restablecer-contrasena?token=…`

Destino del enlace del correo de recuperación (`04_contrato_api_auth.md` §8). No está en el
tablero de diseño; sigue el tono y la estructura de las pantallas 04–07 (`05_diseno_y_ux.md` §3).

| Cosa        | Dónde                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Ruta        | `ROUTES.reset_password` · `RouteHelpers.resetPassword(token?)` · árbol `auth_routes`, **sin** `<Guest>`             |
| Página      | `pages/index.tsx` (`export default`, la carga `lazyPage`)                                                           |
| Endpoint    | `POST /auth/password/reset` (contrato §4, endpoint 6)                                                               |
| Claves i18n | `auth.reset_password.*`, `auth.shared.fields.{new_password,confirm_password}`, `auth.validation.*`, `auth.errors.*` |

## El flujo, de arriba abajo

1. `pages/index.tsx:23` lee el token de la query con `ROUTE_QUERY_PARAM_NAMES.token` (nunca con
   el string `"token"`) y lo recorta.
2. **Sin token** → `pages/index.tsx:26` pinta `ResetLinkInvalid reason="missing_token"`. Un token
   vacío no se manda al servidor: el resultado sería el mismo `400 TOKEN_INVALID` a cambio de una
   petición y de un segundo de espera.
3. **Con token** → el formulario (`components/reset_password_form`). Zod valida los 8 caracteres
   mínimos del contrato y que las dos contraseñas coincidan antes de tocar la red.
4. **Enviando** → `AuthSubmitButton` con spinner, `disabled` y `aria-busy`
   (`src/modules/auth/components/auth_submit_button/index.tsx:21`).
5. **Éxito** → `pages/index.tsx:27` sustituye la tarjeta por `ResetPasswordSuccess`, que avisa de
   que se cerraron las demás sesiones y lleva a `/ingresar`.
6. **`400 TOKEN_INVALID`** → `pages/index.tsx:28` pinta `ResetLinkInvalid reason="expired"`, con
   el botón **Pedir otro enlace** a `/recuperar-contrasena` dentro de la misma tarjeta: la regla
   del brief es que cada vacío trae su acción al lado (`05_diseno_y_ux.md` §5).

## Decisiones

### `axiosPublicInstance`, no `axiosInstance`

El endpoint es público (contrato §4). Además, quien abre este enlace puede tener una sesión
abierta que el propio reset va a revocar: con la instancia autenticada, un token caducado en el
almacenamiento convertiría un `401` en el cierre de sesión global del interceptor
(`src/interceptors/index.ts:113`) y el usuario perdería la pantalla a medio flujo.

### El servicio devuelve `data.data`, que aquí es `undefined`

`services/index.ts:13`. El contrato §4 no declara `data` para este endpoint: el sobre llega sin
carga útil. Se devuelve `data.data` igual que el resto de servicios para que el día que el
backend añada un campo solo cambie el tipo, no la forma de leerlo.

### El hook borra la sesión local; el componente decide el mensaje

`hooks/use_reset_password/index.ts:23` llama a `clearUser()` y
`hooks/use_reset_password/index.ts:24` a `removeQueries({ queryKey: authKeys.all })`. Al
consumirse el token, el backend **revoca todas las sesiones del usuario** (contrato §6): el token
guardado en `localStorage`/`sessionStorage` ya no vale. Si no se borrara, la siguiente petición
autenticada respondería `401` y el interceptor sacaría al usuario de golpe. Por eso la pantalla
de éxito lleva a `/ingresar` y no al catálogo.

El toast vive en el componente (`pages/index.tsx:36`), dentro del `onError` de `mutate` y no en
el render: pintar un toast durante el render lo dispara otra vez en cada re-render.

### Un solo lugar decide qué se ve de cada error

`hooks/use_reset_password_feedback/index.ts` traduce un `ApiError` a una de cuatro cosas:
`expired` (pantalla), `inline` (error bajo el formulario), `toast` o nada. La página usa la
**misma** función para pintar y para notificar (`pages/index.tsx:24` y `pages/index.tsx:35`), así
que ningún error se cuenta dos veces. El reparto sigue `05_diseno_y_ux.md` §5: sin conexión
(`status === 0`) y `500` van a toast con el formulario intacto; `VALIDATION_ERROR` va bajo el
formulario; `TOKEN_INVALID` es pantalla propia.

Todo lo que no es `TOKEN_INVALID` ni `VALIDATION_ERROR` se traduce con `authErrorMessage`
(`src/modules/auth/utils/auth_error_message`), compartido por las 7 pantallas. `RATE_LIMITED` solo
pinta la cuenta atrás cuando el sobre trae `meta.retry_after_seconds`; sin número usa
`errors.retry_later`, que no inventa segundos.

### Los mensajes del schema son claves, no texto

`schemas/index.ts` guarda claves de i18n en los mensajes de Zod (`03_reglas_frontend.md` §12) y el
traductor compartido `src/modules/auth/hooks/use_auth_message` las pasa por `t()`. No es verbosidad
gratuita: las claves de i18n están tipadas y `t(variable)` no compila (`03_reglas_frontend.md` §11).

Ningún campo obligatorio produce dos issues a la vez: `min(1)` + `min(8)` sobre un string vacío
devuelve **las dos** en Zod 4 y ganaba "8 caracteres o más" para un campo vacío. Por eso el mínimo
largo es un `refine` que se salta el caso vacío (`schemas/index.ts:21`).

`meta.fields` del `422` no se pinta por campo en esta pantalla: el único campo del formulario es la
contraseña y el backend no manda ahí nada distinto de lo que ya valida el cliente. Se muestra
`errors.validation_error` bajo el formulario, que es el resumen honesto. El mapa clave-del-backend →
clave tipada, para las pantallas que sí lo necesitan, vive en `src/modules/auth/utils/messages`.

### Accesibilidad y teclado

- `AuthField` enlaza `htmlFor`/`id`, `aria-invalid` y `aria-describedby` con el hint y el error
  (`src/modules/auth/components/auth_field/index.tsx:34`).
- `react-hook-form` mueve el foco al primer campo con error al enviar (`shouldFocusError`, su
  valor por defecto), que es lo que pide `05_diseno_y_ux.md` §3.
- El ojo de ver/ocultar es un `Button type="button"` de `arxatec-ui`, con `aria-pressed` y nombre
  traducido (`src/components/shared/password_input/index.tsx`), así que `Tab` lo alcanza y no envía
  el formulario.
- Los dos campos van con `autocomplete="new-password"` (el campo compartido
  `src/modules/auth/components/password_field` lo recibe por prop):
  sin eso el gestor de contraseñas ofrece la contraseña vieja.
- El formulario nunca se vacía tras un error: `react-hook-form` conserva los valores y no se
  llama a `reset()` en ningún sitio.

## Comprobado

Ejecutado en esta sesión (2026-08-20, árbol de trabajo sin commit):

- `pnpm exec vitest run src/__tests__/modules/auth/features/reset_password` → 3 archivos,
  **14 tests** en verde.
- `pnpm exec tsc -b --noEmit` → sin errores.
- `pnpm exec eslint src/modules/auth/features/reset_password` → sin errores ni avisos.

Qué cubre cada test, contra la lista de `07_gates.md`:

| Gate                                                       | Dónde se comprueba                                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Los tres idiomas sin claves crudas                         | `form.test.tsx` recorre `es`/`en`/`pt` y busca `reset_password.` y `shared.fields` en pantalla |
| Teclado: `Tab` llega al ojo, `Enter` no envía desde él     | `form.test.tsx`                                                                                |
| Teclado: `Enter` envía desde el campo de confirmación      | `form.test.tsx`                                                                                |
| Foco al primer campo con error                             | `form.test.tsx` (`aria-invalid` + `aria-describedby` + `toHaveFocus`)                          |
| Estado de carga con su acción bloqueada                    | `page.test.tsx` (`aria-busy="true"` y `disabled` mientras la promesa está pendiente)           |
| Estado de éxito con su acción                              | `page.test.tsx` (aviso de sesiones cerradas + enlace a `/ingresar`)                            |
| Enlace caducado con su acción                              | `page.test.tsx` (`TOKEN_INVALID` → enlace a `/recuperar-contrasena`)                           |
| Sin token, tratado como enlace inválido                    | `page.test.tsx`                                                                                |
| El formulario no se vacía tras un error                    | `page.test.tsx` (500 y `status 0` conservan las dos contraseñas)                               |
| Un error se cuenta una vez: toast **o** bajo el formulario | `page.test.tsx` (sin conexión → un solo `toast.error`, ningún `role="alert"`)                  |

Tema claro/oscuro y 360 px **no se comprueban en jsdom**; se sostienen por construcción y por
revisión del código, no por medición de esta sesión:

- No hay un solo color literal en la feature: `grep -rniE "bg-white|bg-black|text-white|#[0-9a-f]{3,8}|rgb\("`
  sobre `src/modules/auth/features/reset_password` no devuelve nada. Todo el color sale de
  `text-foreground`, `text-muted-foreground`, `text-destructive` y de los componentes de
  `arxatec-ui`, que ya reaccionan a `.dark`.
- Tampoco hay `font-serif` ni `Cormorant` (D-008): mismo `grep`, cero coincidencias.
- Ancho: la tarjeta es `w-full` dentro del contenedor `max-w-sm` de `AuthLayout`, con
  `px-4` exterior y `p-4` interior. A 360 px dispone de 328 px sin fijar anchos mínimos mayores.

Una sesión anterior en este mismo árbol de trabajo anotó una revisión manual en el navegador
(dev en `:5211`) de los dos temas, los tres idiomas y el toast sin conexión. **No se ha
reproducido aquí**; queda como evidencia de esa sesión, no de esta.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
