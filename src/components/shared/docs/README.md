# `src/components/shared`

Componentes de dominio que cruzan módulos. Los átomos que no están en `arxatec-ui` van a
`components/ui/`; los providers y layouts, a `components/layout/`.

| Componente                  | Para qué                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `theme_selector`            | Tema claro, oscuro o del sistema con botones de radio y texto visible.                          |
| `language_selector`         | Español, English y Português con botones de radio y nombres completos.                         |
| `loading_screen`            | Cargas de datos con un único bloque simple de `Skeleton`.                                       |
| `route_fallback`            | Fallback de rutas con `LoaderSplash size={2}` a pantalla completa.                               |
| `error_screen`              | Pantalla de error: 404 y fallo inesperado, con acción al lado.                                  |
| `site_header`               | Cabecera con marca y cuenta o acceso; sin enlaces centrales ni texto de modo para ningún rol.    |
| `brand_link`, `site_footer` | Marca y pie comunes, con espaciado adaptable.                                                   |
| `account_menu`              | Menú con perfil, salida, Mis cursos en modo usuario y un cambio de modo para cuentas ADMIN.       |
| `admin_navigation`          | Franja desplazable con las cuatro áreas de administración, debajo de la cabecera.               |
| `page_heading`              | Título, descripción y acción de página con una jerarquía consistente.                           |
| `course_cover`              | Portadas de Pexels locales mediante `Image`, con respaldo por tema.                             |
| `lesson_list`               | Filas del temario compartidas entre ficha de curso y lección bloqueada.                         |
| `password_input`            | `Input` y `Button` accesibles para autenticación y perfil.                                      |

La marca compartida, el layout de autenticación y el error inesperado usan
`Logo variant="academy"` de `arxatec-ui`. El enlace de marca conserva el nombre accesible traducido.

Los dos selectores usan `RadioGroup`, `RadioGroupItem`, `Button` y `Label` de `arxatec-ui`, con
`role="radiogroup"`, nombre traducido y una única opción seleccionada mediante `aria-checked`.
Cada opción conserva el botón `outline` de tamaño `sm`, con el radio dentro y el estado activo
resaltado. `Button asChild` da ese aspecto a la etiqueta asociada al radio, por lo que toda la
superficie permite seleccionar la opción. Se muestran en la página privada de perfil (`/perfil`)
y se recorren con Tab y las flechas. El texto usa `text-sm`; las opciones se distribuyen en una
fila que se ajusta al espacio disponible.

Las variantes se eligen con **mapas explícitos de literales** (`theme_selector/index.tsx`,
`error_screen/index.tsx:16`) porque las claves de i18n son tipadas y `t(variable)` no compila.

`error_screen` muestra el título y la descripción del error, con un enlace al catálogo como
única acción. Esto se aplica tanto a un 404 como a los errores inesperados y de conexión.
La variante `not_found` reutiliza `NotFoundContent`, también usado por la página 404,
y se integra en el contenido existente sin añadir otra cabecera ni otro pie.
Las consultas de recursos inexistentes se propagan al límite de rutas, que monta
la página 404 completa para conservar el mismo layout que una ruta desconocida.

`error_screen` es _eager_: lo usa el `errorElement` del router, así que no puede
depender de un chunk que quizá no cargue. El catch-all `*` usa la página dedicada de
`modules/errors/features/not_found`, también importada directamente: muestra el código
404, un título de peso normal, una frase y un botón compacto dentro de `PageShell`.
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
