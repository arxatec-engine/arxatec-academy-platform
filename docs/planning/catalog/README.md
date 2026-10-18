# Catálogo y cursos

El catálogo en `/` permite encontrar cursos publicados sin autenticarse. `GET /courses` recibe búsqueda, tema y nivel; las opciones y facetas proceden del servicio. El estado de búsqueda se conserva con parámetros URL y la consulta de React Query incluye todos los filtros.

La tarjeta completa del curso abre `/cursos/:slug`. La ficha muestra descripción, tema, nivel, duración y temario. Una cuenta inscrita inicia el curso con una inscripción API antes de abrir la primera lección. Una persona visitante puede acceder a la primera lección; esa ruta permite muestras y presenta el estado bloqueado si el backend niega el contenido.

Los formularios públicos de avisos y sugerencias aparecen como acciones secundarias del catálogo y de fichas sin lecciones. No se mezcla el formulario con los resultados de búsqueda.

El catálogo actual presenta cursos gratuitos y no incluye un flujo de compra.

Más detalle en `src/modules/catalog/features/course_catalog/docs/README.md` y `course_detail/docs/README.md`.
