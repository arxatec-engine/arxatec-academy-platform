# `src/routes` — rutas como datos

`routes.ts` es la **fuente única**. Nadie escribe un path a mano: `navigate("/login")` compila,
pasa el lint y en runtime cae en el catch-all (`harness/03_reglas_frontend.md` §8).

| Pieza                                          | Qué es                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `routes.ts`                                    | `ROUTES`, `ROUTE_PARAM_NAMES`, `ROUTE_QUERY_PARAM_NAMES` y `RouteHelpers`.                   |
| `lazy.ts`                                      | `lazyPage(loader)`: devuelve el elemento ya envuelto en `<Suspense>`.                        |
| `auth_routes/`, `app_routes/`, `error_routes/` | Los tres árboles.                                                                            |
| `router/`                                      | `routeTree` (los tres árboles + el `errorElement`) y el `createBrowserRouter` que lo monta.  |
| `error_boundary/`                              | `RouteErrorBoundary`: 404 completo para recursos inexistentes y fallback para otros errores. |

## Parámetros y helpers

`ROUTE_PARAM_NAMES` define `slug`, `course_slug`, `lesson_slug` e `id` para cursos,
lecciones y edición administrativa. `token`, `code` y `redirect_to` siguen en la query.
`RouteHelpers` combina `generatePath` y `URLSearchParams`; los módulos leen sus parámetros
mediante sus hooks de ruta.

El diálogo administrativo del curso conserva el paso en `paso` y la lección desplegada
en `leccion`. `RouteHelpers.adminCourse(id, step?, lessonId?)` genera esos parámetros.
`adminLesson(id)` mantiene los enlaces anteriores y redirige al desplegable del curso.

`generatePath` se importa de `react-router-dom`, la dependencia directa del proyecto.

## Reparto de los árboles

- **`auth_routes`**: `<AuthLayout>` para todas; dentro, `<Guest>` envuelve login, registro y
  recuperación. Reset, verificación y `oauth/callback` cuelgan del layout **sin** guard porque
  consumen un token del correo y deben funcionar con sesión abierta.
- **`app_routes`**: catálogo, ficha y lección públicos; Mis cursos, perfil y revisión de correo
  tras `<Auth>`; cursos, lecciones, comentarios, usuarios y avisos administrativos tras `<Admin>`.
- **`error_routes`**: `/sesion-vencida` (E7, sin guard: quien llega ahí ya no tiene sesión) y el
  catch-all `*`. Van **al final** del array del router.

`RouteErrorBoundary` reconoce los 404 de React Router, las respuestas lanzadas por
parámetros ausentes y los `ApiError` con estado 404. React Query propaga estos últimos
desde su configuración común. En todos esos casos se monta `NotFoundPage` como página
completa, con una sola cabecera, contenido principal y pie, conservando la URL original.
Los demás errores mantienen la pantalla o el estado de carga fallida que les corresponde.

## Carga diferida

Las páginas de contenido entran por `lazyPage(() => import("ruta/literal"))`. El 404 y el
límite de errores se importan directamente para que también estén disponibles si falla
la descarga de una página. El **string literal** no es
estilo: Vite necesita verlo para crear el chunk. Comprobado en `pnpm build`: una entrada por
pantalla, ninguna de ellas dentro del chunk inicial (ver `docs/ARCHITECTURE.md`).

**Ningún barril en el grafo eager.** `src/routes/index.ts` reexporta solo `routes.ts`; si algún día
reexportara `router/`, importar `@/routes` desde el interceptor arrastraría la app entera al chunk
inicial y rompería el code splitting en silencio.

## Inventario

| Clave                 | Path                                          | Helper                                        | Árbol                                  |
| --------------------- | --------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| `home`                | `/`                                           | `RouteHelpers.home()`                         | app (público)                          |
| `course`              | `/cursos/:slug`                               | `RouteHelpers.course(slug)`                   | app (público)                          |
| `lesson`              | `/cursos/:course_slug/lecciones/:lesson_slug` | `RouteHelpers.lesson(courseSlug, lessonSlug)` | app (público con control de contenido) |
| `my_courses`          | `/mis-cursos`                                 | `RouteHelpers.myCourses()`                    | app · `<Auth>`                         |
| `profile`             | `/perfil`                                     | `RouteHelpers.profile()`                      | app · `<Auth>`                         |
| `admin_courses`       | `/admin/cursos`                               | `RouteHelpers.adminCourses()`                 | app · `<Admin>`                        |
| `admin_course_create` | `/admin/cursos/nuevo`                         | `RouteHelpers.adminCourseCreate()`            | app · `<Admin>` · diálogo              |
| `admin_course`        | `/admin/cursos/:id`                           | `RouteHelpers.adminCourse(id)`                | app · `<Admin>`                        |
| `admin_lesson`        | `/admin/lecciones/:id`                        | `RouteHelpers.adminLesson(id)`                | app · `<Admin>` · redirección          |
| `admin_comments`      | `/admin/comentarios`                          | `RouteHelpers.adminComments()`                | app · `<Admin>`                        |
| `admin_users`         | `/admin/usuarios`                             | `RouteHelpers.adminUsers()`                   | app · `<Admin>`                        |
| `admin_notifications` | `/admin/avisos`                               | `RouteHelpers.adminNotifications()`           | app · `<Admin>`                        |
| `login`               | `/ingresar`                                   | `RouteHelpers.login()`                        | auth · `<Guest>`                       |
| `login_email`         | `/ingresar/correo`                            | `RouteHelpers.loginEmail()`                   | auth · `<Guest>`                       |
| `register`            | `/crear-cuenta`                               | `RouteHelpers.register()`                     | auth · `<Guest>`                       |
| `forgot_password`     | `/recuperar-contrasena`                       | `RouteHelpers.forgotPassword()`               | auth · `<Guest>`                       |
| `reset_password`      | `/restablecer-contrasena`                     | `RouteHelpers.resetPassword(token?)`          | auth                                   |
| `verify_email`        | `/verificar-correo`                           | `RouteHelpers.verifyEmail(token?)`            | auth                                   |
| `oauth_callback`      | `/oauth/callback`                             | `RouteHelpers.oauthCallback(code?)`           | auth                                   |
| `check_email`         | `/revisa-tu-correo`                           | `RouteHelpers.checkEmail()`                   | app · `<Auth>`                         |
| `session_expired`     | `/sesion-vencida`                             | `RouteHelpers.sessionExpired()`               | error                                  |
| `not_found`           | `*`                                           | —                                             | error                                  |

`/ingresar` muestra `login_options`: Google y correo electrónico disponibles; Microsoft y
Apple muestran «Próximamente disponible» al pulsarlos. Correo es la primera acción y las políticas
deben permanecer aceptadas para activar cualquiera de las cuatro opciones. Elegir correo lleva a `/ingresar/correo`; crear una
cuenta lleva a `/crear-cuenta`, que solo solicita nombre, correo y contraseña. `AuthLayout`
conserva el `redirect_to` interno válido durante los pasos del acceso.

`src/__tests__/routes/trees.test.ts` comprueba que **todos** los paths de `ROUTES` están
registrados y que ninguno se repite. `src/__tests__/routes/router/index.test.tsx` monta el árbol
real con `createMemoryRouter` y recorre las nueve pantallas: cada una pinta su `h1`, los guards
mandan donde toca y una ruta inventada cae en el `*` — que sigue siendo el último del array.

## Posición al navegar

El elemento raíz es `RouteLayout`, con `Outlet` y `ScrollRestoration`. Las páginas nuevas
se abren desde el inicio y el historial recupera la posición previa. Así, abrir un curso
desde una tarjeta al final del catálogo muestra primero su título y acción de inicio.
La prueba del árbol real verifica el desplazamiento al cambiar de página. Su espera del
encabezado permite hasta cinco segundos para la carga diferida de módulos en el entorno de tests.

Los fallbacks de `lazyPage` muestran `RouteFallback` con el mismo
`LoaderSplash size={2}` de Admin. `index.html` cubre la carga previa a React con
el isotipo estático y su brillo diagonal; no se necesita un chunk para mostrarlo.
Las cargas de datos dentro de cada ruta usan `Skeleton`, incluida la comprobación de sesión.
