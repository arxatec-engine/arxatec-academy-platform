# `src/modules/auth`

El módulo que sostiene las 7 pantallas del login. Lo que vive aquí arriba es lo que comparten
varias features; lo que usa una sola baja a `features/<f>/`.

| Carpeta                            | Qué es                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `types/`                           | `UserUI`, `SessionUI` (camelCase) y `MePayload`. Los `Api*` viven en `@/types/auth`.                   |
| `adapters/`                        | `toUserUI` / `toSessionUI`: el **único** sitio que traduce `snake_case` → `camelCase`.                 |
| `keys/`                            | `authKeys`, la factory de query keys del módulo: `me()`, `verifyEmail(token)`, `googleExchange(code)`. |
| `constants/`                       | `AUTH_ENDPOINTS` (los 11 del contrato) y los límites de contraseña que valida la UI.                   |
| `services/me/`, `services/logout/` | `GET /auth/me` y `POST /auth/logout`. Sin React dentro.                                                |
| `hooks/`                           | `use_logout` (cierre de sesión) y `use_auth_message` (claves de formulario → texto).                   |
| `utils/`                           | `redirect_to`, `messages`, `auth_error_message` y `google_authorize`.                                  |
| `components/`                      | Las piezas que reutilizan las 7 pantallas.                                                             |
| `features/`                        | Una carpeta por pantalla.                                                                              |

`UserUI` añade `isEmailVerified` derivado de `email_verified_at` (`adapters/index.ts:17`) para que
ningún componente tenga que comparar contra `null` a mano. El contrato es explícito en que un
correo sin verificar **no** bloquea el acceso: solo bloquea comentar.

## Los componentes compartidos

| Componente                         | Para qué                                                                      | Accesibilidad                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `auth_card`                        | Composición de encabezado, contenido y pie dentro del panel del layout.       | El título conserva su semántica `h1`.                                                       |
| `google_button`                    | "Continuar con Google", `variant="outline"`, ancho completo.                  | `aria-busy` mientras carga.                                                                 |
| `auth_divider`                     | El separador "o con tu correo".                                               | `aria-hidden`: es decoración.                                                               |
| `auth_field`                       | Label + control + hint + error.                                               | Enlaza `htmlFor`/`id`, `aria-invalid` y `aria-describedby` con el hint y el error a la vez. |
| `auth_submit_button`               | Acción principal, `size="sm"`, ancho completo.                                | `aria-busy` y `disabled` en carga.                                                          |
| `auth_footer_link`                 | El pie a la pantalla hermana.                                                 | —                                                                                           |
| `auth_note`                        | La nota legal en `text-sm text-muted-foreground`.                             | —                                                                                           |
| `components/shared/password_input` | `Input` y `Button` de `arxatec-ui`, compartidos también con perfil.           | Un solo ojo con `aria-pressed`, nombre traducido y foco visible.                            |
| `password_field`                   | `auth_field` + `password_input`: lo que montan login, registro y restablecer. | Hereda los tres atributos de `auth_field`.                                                  |

`auth_field` recibe el control como función (`children({ id, "aria-invalid", "aria-describedby" })`)
en vez de renderizarlo él: así la feature elige `Input`, `Select` o `Checkbox` de `arxatec-ui` sin
que el campo tenga que conocerlos, y los tres atributos de accesibilidad salen siempre del mismo
sitio en vez de repetirse en siete formularios.

## Contraseña y presentación compartidas

`PasswordInput` vive en `src/components/shared/password_input` porque lo consumen autenticación
y perfil. Usa el `Input` y el `Button` de la librería; conserva el valor, el ref de React Hook
Form, el tabulado y el enmascarado. Su adaptación al ojo sin etiqueta de `arxatec-ui@0.1.68`
está explicada en [su README](../../../components/shared/password_input/docs/README.md).

`AuthLayout` copia la estructura y clases de `arxatec-lawyer-platform/src/components/layout/auth`:
`min-h-screen`, `px-4 py-8`, contenedor `w-full max-w-sm`, logo `w-24` y panel único con
`mt-4`, `gap-6`, `bg-card`, `border-border`, `rounded-md` y `p-4`. El logo usa la variante Academy.

`AuthCard` compone contenido, sin borde ni relleno propios. `Header` comparte con Lawyer el
encabezado `text-base` y la descripción `text-sm`, alineados a la izquierda. La selección de
acceso copia también sus textos, bloques y casilla de políticas. Microsoft y Apple conservan
el estado «Próximamente» acordado para Academy.

## Un solo camino para el texto de un error

| Pieza                      | Qué resuelve                                                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utils/messages`           | `AUTH_MESSAGE_KEYS` (las claves que puede llevar un mensaje de Zod o un `setError`), `isAuthMessageKey` y `toAuthMessageKey`, el mapa **backend → clave tipada** para `meta.fields` del `422`. |
| `hooks/use_auth_message`   | Convierte esa clave en texto con `t()`. Lo que no sea una clave declarada se pinta como `errors.validation_error`: una clave cruda del backend **nunca** llega a la pantalla.                  |
| `utils/auth_error_message` | Traduce un `ApiError` a una frase. Cubre **los 12 `meta.code` del contrato** (§5) más el fallo de red (`status === 0`) y el código sin documentar.                                             |
| `utils/require_auth_data`  | Lee `data` del sobre HTTP y unifica el error de contrato si falta; lo usan login, registro, Google y `/me`.                                                     |

`authErrorMessage` no inventa números: un `429` sin `meta.retry_after_seconds` usa
`errors.retry_later` en vez de "prueba de nuevo en 0 s". El contrato solo garantiza
`retry_after_seconds` en `RESEND_COOLDOWN` (§4, endpoint 8), así que el caso se da.

## Las 7 pantallas, y qué comparte cada una

| Pantalla                            | Ruta                                     | Tarjeta                                   | Formulario                                                              | Errores                                |
| ----------------------------------- | ---------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------- |
| Opciones de acceso                  | `/ingresar`                              | `auth_card`                               | Google y correo; Microsoft y Apple muestran «Próximamente» al pulsarlos | —                                      |
| Iniciar sesión por correo           | `/ingresar/correo`                       | `auth_card`                               | `password_field`                                                        | campo + toast con `authErrorMessage`   |
| Crear cuenta                        | `/crear-cuenta`                          | `auth_card`                               | `password_field`                                                        | campo + `authErrorMessage`             |
| Recuperar contraseña                | `/recuperar-contrasena`                  | `auth_card`                               | —                                                                       | campo + toast con `authErrorMessage`   |
| Restablecer contraseña              | `/restablecer-contrasena`                | `auth_card`                               | `password_field` ×2                                                     | toast con `authErrorMessage`           |
| Revisa tu correo / Verificar correo | `/revisa-tu-correo`, `/verificar-correo` | `auth_card` vía `verification_state_card` | —                                                                       | `authErrorMessage`                     |
| Callback de Google                  | `/oauth/callback`                        | `auth_card`                               | —                                                                       | toast con `authErrorMessage`           |
| Sesión vencida                      | `/sesion-vencida`                        | `auth_card`                               | —                                                                       | toast con `authErrorMessage`           |

Ninguna pantalla monta su propia tarjeta, su propio ojo ni su propio diccionario de errores. Si
aparece una octava, hereda las tres cosas sin escribir CSS.

El registro por correo solo solicita nombre, correo y contraseña. No envía organización,
condición de independiente ni ciudad. El backend admite omitir esos datos y conserva el
contrato de respuesta del perfil. Los proveedores sociales se eligen en `login_options`;
Google usa el flujo existente y Microsoft/Apple muestran un aviso de próxima disponibilidad sin iniciar OAuth. `use_auth_return_path`
guarda únicamente destinos internos válidos desde la query del layout de autenticación.

Login y registro componen `AuthBackButton`, `Header` y sus formularios directamente, como
Lawyer. Sus campos usan `gap-4`, los enlaces y textos se comparten con la referencia y el
pie vive dentro del formulario con `mt-4`. Las diferencias de producto son el nombre completo
en un solo campo, el registro de tres datos y el regreso superior a `login_options`.

`useLoginForm`, `useRegisterForm` y `useForgotPasswordForm` coordinan validación, mutación,
errores y navegación; sus componentes solo construyen la UI. El registro pasa el estado real de
envío del correo a `/revisa-tu-correo` para mostrar un reintento inmediato si SMTP falla.
