# Moderación

Ruta solo ADMIN. Consulta hilos recientes, reportados u ocultos con filtros en la clave de React Query y contador dedicado (`GET /admin/comments/counts`). Permite respuesta de equipo a comentarios raíz visibles, ocultar/mostrar y borrar con confirmación. Las mutaciones invalidan la lista administrativa y los hilos públicos. La interfaz anticipa reglas del backend; este vuelve a validar rol, estado y rate limits.

La página usa `AdminPage`, con navegación discreta, títulos de peso normal y contadores compactos. El filtro de estado comparte el encabezado con «Moderación de comentarios» mediante `action`; los contadores quedan debajo. Cada conversación mantiene un contenedor simple con autor, contexto y acciones; una línea separa el formulario de respuesta, que conserva su etiqueta visible. Los controles son de `arxatec-ui` y la navegación usa su `PaginationController` sin personalizar el diseño: controles centrados, números de página, página activa y puntos suspensivos. El total de páginas se calcula con `total` y `page_size`; el componente se oculta con una sola página y se validan los límites al navegar. Cambiar de vista reinicia la página.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
