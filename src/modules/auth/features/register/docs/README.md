# Feature `register` — `/crear-cuenta`

Pantalla 04 del tablero (`harness/05_diseno_y_ux.md` §4) contra `POST /auth/register`
(`harness/04_contrato_api_auth.md` §4, endpoint 1).

| Cosa | Dónde |
| --- | --- |
| Ruta | `ROUTES.register` · `RouteHelpers.register()` · árbol `auth_routes`, bajo `<Guest>` |
| Página | `pages/index.tsx` (`export default`), se registra con `lazyPage(() => import("@/modules/auth/features/register/pages"))` |
| Endpoint | `POST /auth/register` → **201 con sesión iniciada** (`remember_me: true`) |
| Claves i18n | `auth.register.*`, `auth.shared.fields.*`, `auth.validation.*`, `auth.errors.*` |

## El flujo, de arriba abajo

1. **Formulario.** `react-hook-form` + `zodResolver` sobre `schemas/index.ts`. El tipo del
   formulario sale de `z.input`/`z.output`; no se escribe dos veces.
2. **Envío.** `toRegisterRequest` (`schemas/index.ts:74`) traduce el formulario al `snake_case`
   del contrato y `services/index.ts:11` lo manda por `axiosPublicInstance` devolviendo
   `data.data`.
3. **Éxito.** `hooks/use_register/index.ts:20` guarda la sesión (`setSession`, que decide
   `localStorage` o `sessionStorage`) y siembra la caché de `authKeys.me()`; el componente es
   quien navega a `/revisa-tu-correo` (`components/register_form/index.tsx:67`).
4. **Error.** `resolveRegisterError` (`utils/index.ts:50`) traduce el `ApiError` del interceptor a
   *errores por campo* + *feedback global*, y el formulario decide dónde se pinta cada uno.

## Decisiones que no se ven en el código

**`remember_me: true` no es una opción de la pantalla.** El contrato dice que la sesión que
devuelve el registro es `remember_me: true` (§4, endpoint 1), así que la constante vive en el
hook (`hooks/use_register/index.ts:9`) en vez de en una casilla que no existe en el diseño 04.

**El servicio no toca `window`.** `buildGoogleAuthorizeUrl` y `startGoogleAuthorize` viven en
`src/modules/auth/utils/google_authorize/index.ts:7` y `:15` —la integración los subió al módulo
porque login y registro usan los mismos—: un servicio es "axios in, dominio out" y una
redirección de página entera no lo es. La URL se arma con `ENV.API_URL` + `AUTH_ENDPOINTS.google_authorize` y lleva el
destino de retorno para que viaje firmado en el `state` de OAuth (contrato §7).

**`EMAIL_ALREADY_REGISTERED` se pinta en el campo correo, nunca en un toast**
(`utils/index.ts:53`), y el label del campo gana un enlace directo a iniciar sesión
(`components/register_form/index.tsx:139`). Es lo que pide `05_` §5: el ojo ya está en el
formulario, y el error tiene un arreglo con nombre.

**El 422 llega con claves de i18n ya montadas por el backend** (`"email":
"auth.errors.email_invalid"`). Como las claves de este repo son tipadas, `t()` no acepta una
variable: hay dos mapas explícitos, `SERVER_FIELDS` (campo del backend → campo del formulario,
`utils/index.ts:19`) y `SERVER_FIELD_MESSAGE_KEYS` (clave del backend → clave tipada del repo,
`src/modules/auth/utils/messages/index.ts:32`). Lo que no esté en el mapa cae en
`errors.validation_error` en vez de pintar una clave cruda. **La lista completa de claves que
manda el backend no está documentada**: al confirmarla con el equipo de service, se amplía ese
mapa y nada más.

**El orden de `register(...)` decide a qué campo salta el foco.** RHF recorre los campos en el
orden en que se registraron, y `AuthField` recibe sus hijos como función: el `register()` de un
componente hijo (`PasswordField`) se evalúa **antes** que el de un `AuthField` escrito más
arriba, porque el callback del hijo corre después del render del padre. Medido: con las
llamadas en línea, enviar el formulario vacío llevaba el foco a **Contraseña**. Por eso las
cinco registraciones se declaran juntas y en orden visual en
`components/register_form/index.tsx:53-57`. La misma trampa mordió al formulario de login y se
corrigió igual (`src/modules/auth/features/login/docs/README.md`).

**El campo de contraseña es el compartido del módulo**
(`src/modules/auth/components/password_field`), el mismo que usan login y restablecer. El porqué
de no usar `<Input type="password">` de `arxatec-ui` está en `src/modules/auth/docs/README.md`.

**Las dos reglas de comportamiento del diseño viven en el formulario, no en el schema**, porque
son cambios de estado de la UI:

- *Trabajo de forma independiente* → el campo de organización se deshabilita
  (`components/organization_field/index.tsx:43`) y se **limpia**
  (`components/register_form/index.tsx:92`). El backend fuerza `organization: null` igual, pero
  dejar el texto en pantalla mentiría sobre lo que se va a enviar.
- *Otra ciudad* → aparece `city_other` (`components/city_field/index.tsx:87`) y pasa a ser
  obligatorio (`schemas/index.ts:49`); al cambiar a otra ciudad se limpia
  (`components/register_form/index.tsx:98`) para no mandar una ciudad huérfana.

**Las etiquetas de ciudad se resuelven con un mapa explícito** `ApiUserCity → clave`
(`components/city_field/index.tsx:18`): las claves son tipadas, y `` t(`...${city}`) `` no
compila.

**Los mensajes del schema son claves, no texto** (`schemas/index.ts:19` en adelante), y el
traductor compartido `src/modules/auth/hooks/use_auth_message` es quien las pasa por `t()`.
Cualquier cosa que no sea una clave declarada en `AUTH_MESSAGE_KEYS`
(`src/modules/auth/utils/messages/index.ts:1`) se pinta como `errors.validation_error`: así un
mensaje crudo del backend nunca llega a la pantalla.

**Ningún campo obligatorio produce dos issues a la vez.** `min(1)` + `min(8)` sobre un string
vacío devuelve *las dos* en Zod 4, y el mapa de mensajes se quedaba con la última
("8 caracteres o más" para un campo vacío). Por eso el mínimo largo es un `refine` que se salta
el caso vacío (`schemas/index.ts:21` y `:35`).

## Estados que pinta la pantalla

| Estado | Qué se ve |
| --- | --- |
| Enviando | botón con spinner, `aria-busy`, deshabilitado, y todos los campos deshabilitados |
| Campo inválido (cliente) | mensaje bajo el campo, `aria-invalid` + `aria-describedby`, foco en el primero |
| Correo ya registrado | mismo mensaje en el campo correo + enlace **Inicia sesión** junto al label |
| 422 del backend | los campos que vengan en `meta.fields`; si ninguno es del formulario, toast genérico |
| 429 / 500 / sin conexión | toast (`sonner`) con acción **Reintentar**; **el formulario conserva lo escrito** |

## Tests

`src/__tests__/modules/auth/features/register/` — schema y adaptación al contrato, servicio
(endpoint, `data.data`, sobre malformado), traducción de errores, y la página completa:
textos literales, las dos reglas de comportamiento, el `snake_case` que sale por el cable,
navegación a `/revisa-tu-correo`, el correo repetido con su enlace, el recorrido con `Tab`
—incluida la ciudad con `Enter`/`ArrowDown`— y los tres idiomas sin claves crudas.
