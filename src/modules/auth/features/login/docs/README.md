# Feature `login` — `/ingresar`

Pantalla 05 del tablero (`harness/05_diseno_y_ux.md` §4) contra `POST /auth/login`
(`harness/04_contrato_api_auth.md` §4.2).

| Cosa | Dónde |
| --- | --- |
| Ruta | `ROUTES.login` · `RouteHelpers.login()` · árbol `auth_routes`, bajo `<Guest>` (`src/routes/auth_routes/index.tsx:17`) |
| Página | `pages/index.tsx`, `export default` (lo exige `lazyPage`) |
| Endpoint | `AUTH_ENDPOINTS.login` con `axiosPublicInstance` (`services/index.ts:20`) |
| Claves i18n | `auth.login.*`, `auth.shared.*`, `auth.validation.*`, `auth.errors.*` |

## El flujo

```text
LoginPage           isotipo, título, subtítulo, botón de Google, separador, formulario y pie
 └─ LoginForm       react-hook-form + zodResolver(loginSchema)
     └─ useLogin    useMutation(login) → setSession + siembra la caché de /auth/me
         └─ login   axios in, ApiSession out; sin React dentro
```

Al volver la sesión, el componente decide a dónde va: `consumeReturnPath() ?? RouteHelpers.home()`
(`components/login_form/index.tsx:108`). `consumeReturnPath` se importa de
`@/modules/auth/utils/redirect_to` (`components/login_form/index.tsx:19`), que es la **puerta única
del módulo** para el destino de retorno (`docs/ARCHITECTURE.md` §3); `consumeRedirectTo` de
`@/services/auth_storage` es la capa de almacenamiento y la usa el interceptor, no las pantallas. El
destino lo dejó el guard `<Auth>` en `sessionStorage`; se **consume**, no se lee, para que un
segundo login no reviva un destino viejo. El path nunca se escribe a mano: sale de `RouteHelpers`
(regla de `03_` §8.1).

## Las seis decisiones que no se ven en el código

**1 · `axiosPublicInstance`, no `axiosInstance`.** La instancia autenticada cierra sesión ante un
401 (`src/interceptors/index.ts:147`). El login *vive* de un 401 legítimo
(`INVALID_CREDENTIALS`), así que con la instancia autenticada cada contraseña mal escrita
provocaría una redirección. La pública solo normaliza el error a `ApiError`
(`src/interceptors/index.ts:161`).

**2 · `remember_me` decide el almacenamiento, y lo decide una sola función.** El hook llama a
`setSession(token, user, values.rememberMe)` (`hooks/use_login/index.ts:19`) y quien elige es
`writeAuthSession`: `localStorage` si está marcado, `sessionStorage` si no
(`src/services/auth_storage/index.ts:79`), tal cual la tabla del contrato §3. La casilla nace
marcada (`schemas/index.ts:28`) porque el brief la pide así, y `rememberMe` viaja al backend como
`remember_me` (`services/index.ts:16`): el mismo booleano fija la inactividad tolerada (30 días
frente a 12 horas) y el sitio donde guardamos el token. Ningún componente toca `localStorage`.

**3 · `removeQueries()` antes de sembrar `/auth/me`** (`hooks/use_login/index.ts:20-21`). Entrar
con otra cuenta en la misma pestaña dejaría la caché del usuario anterior viva y visible hasta el
primer refetch. Se tira entera y se siembra el usuario que acaba de llegar, para que `<Auth>` no
dispare una petición que ya sabemos responder.

**4 · `INVALID_CREDENTIALS` se pinta bajo el formulario y no dispara toast**
(`components/login_form/index.tsx:169-171`; el `if` de `notifyError` lo excluye expresamente en
`:87-92`). El
ojo del usuario está en el formulario que acaba de enviar, no en la esquina de la pantalla. El
texto es el mismo para correo inexistente y para contraseña incorrecta: distinguirlos convertiría
el login en un oráculo de correos registrados (contrato §4.2).

**5 · `ACCOUNT_USES_GOOGLE` es la única excepción a esa regla** (`:173-178`): ahí sí se dice qué
pasa y se ofrece el botón de Google al lado del mensaje, porque sin eso el usuario no tiene forma
de saber por qué "su" contraseña no funciona.

**6 · El formulario nunca se vacía.** El error vive en la mutación y en `formState`, nunca en un
remount: tras un 401, un 422 o una caída de red, el correo y la contraseña siguen escritos. Los
demás códigos sí van a toast (red, `RATE_LIMITED` con `retry_after_seconds`, `INTERNAL_ERROR`), y
`VALIDATION_ERROR` pinta `meta.fields` sobre los campos con `setError(..., { shouldFocus })`
(`:79`), que mueve el foco al primero con error.

## El orden de `register(...)` decide a qué campo salta el foco

`emailRegistration` y `passwordRegistration` se declaran juntos y en orden visual justo después del
`useForm` (`components/login_form/index.tsx:67-68`), igual que en el registro
(`src/modules/auth/features/register/components/register_form/index.tsx:53-57`). No es cosmética:
react-hook-form mueve el foco al primer campo con error **en orden de registro**, y `AuthField`
recibe sus hijos como función. Con las llamadas en línea, `register("password")` —prop de
`<PasswordField>`— se evaluaba durante el render de `LoginForm`, mientras que `register("email")`
—dentro del render prop de `<AuthField>`— no corría hasta que React pintaba el hijo: la contraseña
quedaba registrada **antes** que el correo. Medido montando el árbol real: al enviar el formulario
vacío se pintaban las dos alertas en orden ("Escribe tu correo." primero) pero el foco caía en
`login-password`, así que un lector de pantalla anunciaba el error de la contraseña y dejaba el del
correo arriba y fuera de foco. `05_` §3 lo exige al revés: *el foco se mueve al primer campo con
error al enviar*. Lo fija el test "valida en el navegador antes de llamar al contrato"
(`src/__tests__/modules/auth/features/login/pages/index.test.tsx`), que ahora espera el foco en
"Correo"; ningún otro gate lo detecta.

## El campo de contraseña vive en el módulo, no aquí

La integración subió el componente a `src/modules/auth/components/password_input` y su envoltorio
con label a `src/modules/auth/components/password_field`: login, registro y restablecer usan **el
mismo**. El porqué de que no sea `<Input type="password">` de `arxatec-ui` está en
`src/modules/auth/docs/README.md`; el test vive en
`src/__tests__/modules/auth/components/password_input/index.test.tsx`.

## Estados pintados

| Estado | Qué se ve | Acción al lado |
| --- | --- | --- |
| Vacío (inicial) | formulario limpio, casilla marcada | Google arriba, "Créala en un minuto" abajo |
| Enviando | botón con spinner, `aria-busy`, deshabilitado | — |
| Error de campo | mensaje bajo el campo, `aria-invalid` + `aria-describedby`, foco al primero | reescribir |
| Credenciales incorrectas | `role="alert"` bajo el formulario | "¿La olvidaste?" sigue a mano |
| Cuenta de Google | `role="alert"` con el mensaje | botón "Continuar con Google" dentro del aviso |
| Sin conexión / 429 / 500 | toast de `sonner` | lo escrito se conserva |

## Comprobado en el navegador (dev, tema claro y oscuro)

- Los dos temas, sin `bg-white` ni color hardcodeado: solo clases semánticas de los tokens.
- Teclado solo: `Tab` recorre Google → correo → "¿La olvidaste?" → contraseña → ojo → casilla →
  "Iniciar sesión"; `Enter` envía desde cualquier campo; el anillo de foco se ve.
- `es`, `en` y `pt` sin claves crudas a la vista; `<html lang>` sigue al idioma.
- 360 px: la tarjeta baja a 336 px y ningún elemento se sale (Chrome en macOS no deja una ventana
  por debajo de 528 px de viewport, así que la medición se hizo acotando el `body` a 360 px).
- Tipografía: `ArxatecSans` en todos los nodos de la pantalla. **Cero serif**, aunque el tablero la
  use (`harness/08_decisiones.md` D-008 y `03_` §14).
