# Avisos y temas administrativos

Ruta solo ADMIN. Lista altas a avisos con filtro por estado y paginación, exporta el CSV autenticado, muestra solicitudes de tema agrupadas y permite borrar una dirección en ambas tablas mediante confirmación. El formulario “marcar anteriores” envía `course_id` (null para catálogo general) y una fecha de corte ISO; no envía correos, solo cambia el estado de las altas anteriores al corte. Las mutaciones invalidan listados relevantes.

El corte se captura antes de solicitar el CSV y solo se habilita el marcado cuando la descarga tiene éxito. Usar la hora del clic de marcado incluiría altas llegadas después de la exportación. El corte se mantiene en la sesión de la pantalla: al recargar, hay que exportar de nuevo. El administrador selecciona el grupo al que efectivamente escribió antes de marcarlo.

La página usa `AdminPage` y secciones `AdminSection` separadas por líneas, con títulos de peso normal. Altas y solicitudes se presentan en filas compactas; los filtros y acciones se ajustan al ancho disponible. `AdminPagination` comparte los controles de página con el directorio. Se mantiene la separación entre exportar, marcar y borrar.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
