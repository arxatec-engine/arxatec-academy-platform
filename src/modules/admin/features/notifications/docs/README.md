# Avisos y temas administrativos

Ruta solo ADMIN. Lista altas a avisos con filtro por estado y paginación, exporta el CSV autenticado, muestra solicitudes de tema agrupadas y permite borrar una dirección en ambas tablas mediante confirmación. El formulario “marcar anteriores” envía `course_id` (null para catálogo general) y una fecha de corte ISO; no envía correos, solo cambia el estado de las altas anteriores al corte. Las mutaciones invalidan listados relevantes.

El corte se captura antes de solicitar el CSV y solo se habilita el marcado cuando la descarga tiene éxito. Usar la hora del clic de marcado incluiría altas llegadas después de la exportación. El corte se mantiene en la sesión de la pantalla: al recargar, hay que exportar de nuevo. El administrador selecciona el grupo al que efectivamente escribió antes de marcarlo.

La página usa `AdminPage` y una tarjeta con cuatro secciones desplegables: «Suscripciones a
avisos», «Marcar anteriores como avisados», «Temas solicitados» y «Borrar dirección». Todas empiezan
cerradas, mostrando solo el título y la flecha. `NotificationSection` comparte la animación
y la presentación agrupada de los desplegables de lecciones, con separadores de ancho completo
y soporte de movimiento reducido. Las secciones se abren de forma independiente y conservan
filtros, selecciones, correos escritos y el corte de exportación al plegarse.
Altas y solicitudes se presentan en filas compactas; los separadores entre suscripciones y
entre temas solicitados abarcan el ancho completo de la sección y cada fila conserva el
padding de su contenido.
La primera suscripción incluye un borde superior y la última un borde inferior,
ambos del ancho completo de la sección.
Los filtros y acciones se ajustan al ancho disponible. Las suscripciones usan `PaginationController` de `arxatec-ui` con su diseño
original, igual que el directorio y moderación: controles centrados, números de página y
página activa. El total de páginas se calcula con `total` y `per_page`; la navegación valida
los límites y conserva el filtro de estado. El componente se oculta si hay una sola página.
Se mantiene la separación entre exportar, marcar y borrar, incluida la confirmación de eliminación.

Todos los textos de la pantalla usan `text-sm`, incluidos el título de la página,
los badges y el diálogo de eliminación. Las secciones establecen ese tamaño como
base y los controles y mensajes de estado conservan el mismo tamaño.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
