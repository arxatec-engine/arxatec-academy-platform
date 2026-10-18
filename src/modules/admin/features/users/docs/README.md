# Directorio de estudiantes

Ruta solo ADMIN. `GET /admin/users` recibe búsqueda, ciudad, orden y página; el objeto completo de filtros está en la clave de React Query. La UI muestra estadísticas del servidor y cursos completados por usuario. `GET /admin/users/export` solicita CSV autenticado como Blob con los mismos filtros; el hook provoca la descarga sin exponer el bearer token en una URL pública. El backend filtra/exporta también campos avanzados que el servicio admite, aunque la pantalla aún solo ofrece búsqueda, ciudad y orden.

La página usa `AdminPage`, con títulos de peso normal y filtros sin tarjeta adicional. Las personas aparecen en tarjetas compactas con inicial, datos y verificación; los textos largos pueden partirse sin desbordar. Las estadísticas tienen espaciado propio y la navegación usa `PaginationController` de `arxatec-ui`, igual que moderación, respetando su diseño: controles centrados, números de página, página activa y puntos suspensivos. No añade bordes ni distribuye los controles a los extremos. El componente se oculta si hay una sola página; cambiar de página mantiene los filtros y valida los límites. Se usa `AvatarFallback` porque el contrato no incluye una URL de avatar.

Los filtros siguen la presentación del catálogo: buscador con icono, ciudad y orden en una
fila de controles `size="sm"`, fondo `bg-card` y separación `gap-2`. En móvil el buscador ocupa
la primera fila y los dos selectores comparten la segunda. La búsqueda se aplica al escribir
con una espera de 300 ms y también admite Enter; cada cambio de filtro vuelve a la primera
página. La descarga CSV conserva los filtros aplicados y aparece junto al título
«Directorio de estudiantes», mediante la acción del encabezado de `AdminPage`.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.

Las tarjetas muestran nombre, correo y badges de cursos completados y verificación, sin
la línea de organización, trabajo independiente o ciudad. El avatar usa `size-12` y
`border border-border`, centrado verticalmente junto al nombre y correo.
La lista muestra tres columnas en escritorio, dos en pantallas intermedias y una en móvil.
