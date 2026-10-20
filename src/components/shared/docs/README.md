# `src/components/shared`

Componentes de dominio que cruzan módulos. Los átomos que no están en `arxatec-ui` van a
`components/ui/`; los providers y layouts, a `components/layout/`.

| Componente                  | Para qué                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `theme_selector`            | Tema claro, oscuro o del sistema con botones de radio y texto visible.                          |
| `language_selector`         | Español, English y Português con botones de radio y nombres completos.                         |
| `loading_screen`            | Cargas de datos con un único bloque simple de `Skeleton`.                                       |
| `route_fallback`            | Fallback de rutas con `LoaderSplash size={2}` a pantalla completa.                               |
| `error_screen`              | Páginas 404 y de error con título, descripción y acción de regreso centrados.                   |
| `site_header`               | Cabecera con marca y cuenta o acceso; sin enlaces centrales ni texto de modo para ningún rol.    |
| `brand_link`, `site_footer` | Marca y pie comunes, con espaciado adaptable.                                                   |
| `account_menu`              | Menú con perfil, salida, Mis cursos en modo usuario y un cambio de modo para cuentas ADMIN.       |
| `admin_navigation`          | Franja desplazable con las cuatro áreas de administración, debajo de la cabecera.               |
| `page_heading`              | Título, descripción y acción de página con una jerarquía consistente.                           |
| `course_cover`              | Portadas de Pexels locales mediante `Image`, con respaldo por tema.                             |
| `lesson_list`               | Filas del temario compartidas entre ficha de curso y lección bloqueada.                         |
| `password_input`            | `Input` y `Button` accesibles para autenticación y perfil.                                      |

La marca compartida y el layout de autenticación usan
`Logo variant="academy"` de `arxatec-ui`. El enlace de marca conserva el nombre accesible traducido.

Los dos selectores usan `RadioGroup`, `RadioGroupItem`, `Button` y `Label` de `arxatec-ui`, con
`role="radiogroup"`, nombre traducido y una única opción seleccionada mediante `aria-checked`.
Cada opción conserva el botón `outline` de tamaño `sm`, con el radio dentro y el estado activo
resaltado. `Button asChild` da ese aspecto a la etiqueta asociada al radio, por lo que toda la
superficie permite seleccionar la opción. Se muestran en la página privada de perfil (`/perfil`)
y se recorren con Tab y las flechas. El texto usa `text-sm`; las opciones se distribuyen en una
fila que se ajusta al espacio disponible.

Los estados sin registros, errores de sección y avisos persistentes usan `StatusMessage` de
`arxatec-ui`, con `size="sm"`, `color="rose"` para errores de sección y `color="white"` para vacíos o
información. El contenedor conserva `role="alert"` o `role="status"`; las acciones permanecen
fuera de la tarjeta del mensaje. Esto incluye los estados de autenticación mediante
`AuthCard`, las validaciones, los resultados de examen y las secciones administrativas.
Las páginas 404 y de error de servidor o conexión no usan `StatusMessage`.
Las cargas usan `Skeleton` y las notificaciones transitorias de acciones, el `Toaster` compartido.

Las variantes se eligen con **mapas explícitos de literales** (`theme_selector/index.tsx`,
`error_screen/index.tsx:16`) porque las claves de i18n son tipadas y `t(variable)` no compila.

`error_screen` es la página compartida para el 404 y los errores inesperados o de conexión.
Ambas variantes usan el mismo `PageShell`: cabecera y pie, contenido centrado, etiqueta pequeña,
título `h1`, descripción y botón compacto de regreso al catálogo. Cambian el texto
y el anuncio accesible. La etiqueta es «404» para un recurso inexistente y «Error» para el resto,
sin atribuir un código HTTP a un fallo de red. `useTitle` actualiza el título traducido.
Los fallos de carga de página se propagan al límite de rutas, que sustituye la pantalla completa
y conserva la URL. Así hay una sola cabecera, un contenido principal y un pie, también desde
administración. Los fallos recuperables de formularios o secciones mantienen su mensaje local.

`error_screen` es _eager_: lo usa el `errorElement` del router, así que no puede
depender de un chunk que quizá no cargue. El catch-all `*` usa la página dedicada de
`modules/errors/features/not_found`, también importada directamente, que delega en
`ErrorScreen kind="not_found"`.
`route_fallback` es el `fallback` de todos los
`<Suspense>` de `lazyPage`, y por eso pinta su propio fondo con `bg-background`: si fuera
transparente, el salto entre chunks se vería como un parpadeo blanco en tema oscuro.

`RouteFallback` reutiliza `LoaderSplash size={2}` de `arxatec-ui`, igual que Admin:
isotipo de 2 rem (32 px con la fuente base), brillo diagonal y sin texto visible debajo.
El contenedor adapta `h-screen w-screen` del paquete a tamaño automático para evitar
scroll adicional. El nombre accesible viene de i18n; el indicador interno se oculta
al árbol accesible para anunciar una sola carga. Se reserva para el fallback de rutas.

`LoadingScreen` muestra un único bloque rectangular de `Skeleton` de `arxatec-ui` para las
cargas de datos. Solo la comprobación inicial de sesión usa `fullScreen`; los demás bloques
ocupan su sección dentro de la página.
El estado tiene un único anuncio accesible traducido y las formas decorativas se ocultan
al árbol accesible. Los comentarios, el perfil y los estados de autenticación también usan
un único `Skeleton` simple en sus cargas de contenido.

`index.html` incluye el mismo splash estático de Admin antes de cargar JavaScript,
con colores del sistema y soporte de movimiento reducido. React lo sustituye al
montar y `lazyPage` mantiene `RouteFallback` mientras descarga la página.
En desarrollo, `/?preview=splash` permite revisar el indicador sin esperar una carga.

`site_header` no muestra ajustes de idioma o apariencia. Con sesión, `account_menu`
enlaza a `/perfil`, donde se eligen idioma y tema; sin sesión solo ofrece las acciones de acceso.

La opción «Cerrar sesión» aparece para estudiantes y administradores y reutiliza `useLogout`.
Llama a `POST /auth/logout`, limpia la sesión local y la caché de React Query y vuelve a
`/ingresar`, también si la petición falla. Mientras se envía, la opción queda deshabilitada.
