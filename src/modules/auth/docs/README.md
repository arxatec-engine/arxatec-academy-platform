# `src/modules/auth`

El módulo que sostiene las 7 pantallas del login. Lo que vive aquí arriba es lo que comparten
varias features; lo que usa una sola baja a `features/<f>/`.

| Carpeta | Qué es |
| --- | --- |
| `types/` | `UserUI`, `SessionUI` (camelCase) y `MePayload`. Los `Api*` viven en `@/types/auth`. |
| `adapters/` | `toUserUI` / `toSessionUI`: el **único** sitio que traduce `snake_case` → `camelCase`. |
| `keys/` | `authKeys`, la factory de query keys del módulo: `me()`, `verifyEmail(token)`, `googleExchange(code)`. |
| `constants/` | `AUTH_ENDPOINTS` (los 11 del contrato) y los límites de contraseña que valida la UI. |
| `services/me/`, `services/logout/` | `GET /auth/me` y `POST /auth/logout`. Sin React dentro. |
| `hooks/` | `use_logout` (cierre de sesión) y `use_auth_message` (claves de formulario → texto). |
| `utils/` | `redirect_to`, `messages`, `auth_error_message` y `google_authorize`. |
| `components/` | Las piezas que reutilizan las 7 pantallas. |
| `features/` | Una carpeta por pantalla. |

`UserUI` añade `isEmailVerified` derivado de `email_verified_at` (`adapters/index.ts:17`) para que
ningún componente tenga que comparar contra `null` a mano. El contrato es explícito en que un
correo sin verificar **no** bloquea el acceso: solo bloquea comentar.

## Los componentes compartidos

| Componente | Para qué | Accesibilidad |
| --- | --- | --- |
| `auth_card` | Tarjeta centrada de ~420 px: isotipo de 28 px, `h1`, subtítulo, contenido y pie. | El isotipo usa `currentColor`, así que cambia con el tema sin lógica extra. |
| `google_button` | "Continuar con Google", `variant="outline"`, ancho completo. | `aria-busy` mientras carga. |
| `auth_divider` | El separador "o con tu correo". | `aria-hidden`: es decoración. |
| `auth_field` | Label + control + hint + error. | Enlaza `htmlFor`/`id`, `aria-invalid` y `aria-describedby` con el hint y el error a la vez. |
| `auth_form_error` | El error **bajo el formulario** (credenciales incorrectas). | `role="alert"`. |
| `auth_submit_button` | Acción principal, `size="lg"`, ancho completo. | `aria-busy` y `disabled` en carga. |
| `auth_footer_link` | El pie a la pantalla hermana. | — |
| `auth_note` | La nota legal en `text-xs text-muted-foreground`. | — |
| `password_input` | El `<input type="password">` con **un** ojo de mostrar/ocultar. | `aria-pressed` y `aria-label` traducida; el foco se ve porque usa `focus-visible:ring-ring`. |
| `password_field` | `auth_field` + `password_input`: lo que montan login, registro y restablecer. | Hereda los tres atributos de `auth_field`. |

`auth_field` recibe el control como función (`children({ id, "aria-invalid", "aria-describedby" })`)
en vez de renderizarlo él: así la feature elige `Input`, `Select` o `Checkbox` de `arxatec-ui` sin
que el campo tenga que conocerlos, y los tres atributos de accesibilidad salen siempre del mismo
sitio en vez de repetirse en siete formularios.

## Por qué `password_input` no es `<Input type="password">`

`arxatec-ui` intercepta `type="password"` y monta **su propio** ojo
(`node_modules/arxatec-ui/dist/components/input/index.js`): un `<button>` sin nombre accesible, sin
`aria-pressed` y con `focus:outline-none`, y de paso pierde el `data-slot="input"`. Usarlo dejaba
**dos** ojos superpuestos y una parada de tabulación muda con el foco invisible. Por eso el
componente pinta un `<input>` nativo con el `inputVariants()` **de la propia librería** (mismos
tokens, mismo tema oscuro, cero colores hardcodeados) y un solo ojo etiquetado.

Si algún día `arxatec-ui` etiqueta su botón y respeta `focus-visible`, este componente sobra.
Merece un issue contra la librería.

## Un solo camino para el texto de un error

| Pieza | Qué resuelve |
| --- | --- |
| `utils/messages` | `AUTH_MESSAGE_KEYS` (las claves que puede llevar un mensaje de Zod o un `setError`), `isAuthMessageKey` y `toAuthMessageKey`, el mapa **backend → clave tipada** para `meta.fields` del `422`. |
| `hooks/use_auth_message` | Convierte esa clave en texto con `t()`. Lo que no sea una clave declarada se pinta como `errors.validation_error`: una clave cruda del backend **nunca** llega a la pantalla. |
| `utils/auth_error_message` | Traduce un `ApiError` a una frase. Cubre **los 12 `meta.code` del contrato** (§5) más el fallo de red (`status === 0`) y el código sin documentar. |

`authErrorMessage` no inventa números: un `429` sin `meta.retry_after_seconds` usa
`errors.retry_later` en vez de "prueba de nuevo en 0 s". El contrato solo garantiza
`retry_after_seconds` en `RESEND_COOLDOWN` (§4, endpoint 8), así que el caso se da.

## Las 7 pantallas, y qué comparte cada una

| Pantalla | Ruta | Tarjeta | Formulario | Errores |
| --- | --- | --- | --- | --- |
| Iniciar sesión | `/ingresar` | `auth_card` | `password_field` | `auth_form_error` + `authErrorMessage` |
| Crear cuenta | `/crear-cuenta` | `auth_card` | `password_field` | campo + `authErrorMessage` |
| Recuperar contraseña | `/recuperar-contrasena` | `auth_card` | — | `auth_form_error` + `authErrorMessage` |
| Restablecer contraseña | `/restablecer-contrasena` | `auth_card` | `password_field` ×2 | `auth_form_error` + `authErrorMessage` |
| Revisa tu correo / Verificar correo | `/revisa-tu-correo`, `/verificar-correo` | `auth_card` vía `verification_state_card` | — | `authErrorMessage` |
| Callback de Google | `/oauth/callback` | `auth_card` | — | `auth_form_error` + `authErrorMessage` |
| Sesión vencida | `/sesion-vencida` | `auth_card` | — | `auth_form_error` + `authErrorMessage` |

Ninguna pantalla monta su propia tarjeta, su propio ojo ni su propio diccionario de errores. Si
aparece una octava, hereda las tres cosas sin escribir CSS.
