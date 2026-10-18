# Estructura de página

`PageShell` reúne cabecera, contenido principal y pie para catálogo, cursos, lecciones, perfil,
Mis cursos y administración. Mantiene un ancho máximo común, márgenes adaptables y una fuente
sans. Acepta `className` para las páginas con una medida de lectura más estrecha.
La prop opcional `navigation` coloca la navegación secundaria inmediatamente debajo de
`SiteHeader` y antes de `main`. `AdminLayout` la usa para `AdminNavigation`, alineada al mismo
ancho y márgenes que la cabecera y el contenido.
El layout administrativo permanece montado entre secciones; solo cambia su contenido y las
cargas de ruta muestran un esqueleto dentro de `main`. La barra activa se desplaza y ajusta
su ancho con una transición de 300 ms, también al cambiar idioma o tamaño de pantalla.
La preferencia de movimiento reducido desactiva la transición.

El texto común usa `text-sm` en ambos layouts y como base del `body`, incluidos los controles
que se renderizan fuera del layout mediante portales. Descripciones, metadatos, enlaces,
comentarios y formularios comparten ese tamaño. El tamaño máximo de texto es `text-2xl`,
también en variantes responsivas; las notas pequeñas se mantienen en `text-sm`.
Los valores siguen los tokens de `arxatec-ui`, con `--font-scale: 1.1`
definido en `src/index.css`. Todos los radios usan `rounded-md`; el tema también unifica los
radios predeterminados de los controles de la librería, incluidos los menús y los portales.

El enlace “Saltar al contenido” aparece al recibir foco y apunta a `main-content`. La cabecera
conserva marca y navegación; el menú de cuenta enlaza al perfil, que reúne los datos personales
y los ajustes de idioma y apariencia, y muestra los destinos según el rol. `AdminNavigation` reúne las cuatro áreas
administrativas en una franja desplazable. Los controles vienen de `arxatec-ui`.

La navegación, los botones de formulario y las acciones secundarias usan `size="sm"`.
Los inputs y los selectores comparten ese tamaño para alinear las filas de controles.
La acción de empezar un curso conserva el tamaño predeterminado, y los botones que ocupan
tarjetas, filas o encabezados desplegables mantienen el espacio necesario para su contenido.
Los controles de icono conservan `size="icon"`.

`AuthLayout` copia el contenedor de Lawyer: `min-h-screen`, `max-w-sm`, logo Academy de ancho
`w-24` y un único panel con `mt-4`, `gap-6`, `bg-card`, borde y `p-4`. Las pantallas componen
su contenido dentro del panel; no añaden otra tarjeta. El encabezado usa `text-base`. El plugin
PostCSS `academy-sans-only`, declarado en `vite.config.ts`, elimina los imports de Google Fonts
incluidos en la librería y normaliza las declaraciones `font-family` a `--font-sans`, excepto
las de `@font-face`. Los archivos ArxatecSans empaquetados con la librería permanecen intactos.

El layout raíz `RouteLayout` monta `Outlet` y `ScrollRestoration` de React Router.
Al navegar abre la página desde arriba; al volver conserva la posición anterior.
El desplazamiento permanece inmediato. La prueba del árbol real cubre el reinicio
al navegar entre acceso y registro.
