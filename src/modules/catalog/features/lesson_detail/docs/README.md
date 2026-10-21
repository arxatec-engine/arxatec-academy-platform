# Lección

`GET /courses/:course_slug/lessons/:lesson_slug` devuelve una lección completa o `403 LESSON_LOCKED` con un temario limitado. El servicio convierte ambos casos en `LessonResult`; `LessonContent` muestra el estado apropiado con `AsyncBoundary`. La página solo compone encabezado y contenido.

Un curso o una lección inexistente muestra la misma página 404 completa que una
ruta desconocida mediante `RouteErrorBoundary`. Se conserva la URL original.
El estado `LESSON_LOCKED` mantiene su pantalla de acceso al contenido.

`LessonMaterial` selecciona el iframe por proveedor (`YOUTUBE` usa youtube-nocookie, `VIMEO` usa player.vimeo.com); el enlace externo sirve como respaldo. `articleBody` proviene del HTML saneado por el backend; no se sanea de nuevo en el cliente. La finalización usa `useCompleteLesson` e invalida Mis cursos. Los comentarios son públicos; crear y responder exigen correo verificado.

La página usa `PageShell` con una medida de lectura más estrecha. `LessonMaterial` compone
`LessonVideo` y `LessonTranscript`; la transcripción se revela con `Collapsible`, y el artículo usa `.academy-article` con tipografía
sans, interlineado y enlaces legibles. El texto del artículo, la transcripción y los detalles
de las lecciones usan el token de `text-sm`; los encabezados del artículo conservan su tamaño destacado. Anterior y
siguiente son acciones de ancho consistente. `LessonList` comparte el
temario de la ficha y la pantalla bloqueada. La finalización es un botón de solo icono junto
al título de la lección. Su tooltip explica la acción al pasar el cursor o recibir foco
con el teclado. El mismo botón permite marcar y desmarcar la lección; el icono cambia
de círculo vacío a círculo con marca y expone su estado con `aria-pressed`. Se deshabilita
mientras se guarda el cambio. Al completar todas las lecciones, la última lección muestra
«Dar examen» en el lugar de «Siguiente lección», con el mismo estilo y flecha de navegación.
No se muestra el aviso de finalización encima del contenido. La disponibilidad se consulta
en el progreso guardado de Mis cursos y se conserva al recargar o volver a la lección.
La ficha del curso conserva `CourseCertification`. El botón de marca recupera su estado cuando el curso está completo. Si ya existe un certificado se conserva el acceso a él en la navegación; la marca de
una lección no emite certificados nuevos.
Recursos y Comentarios forman un único
bloque plegable con borde exterior y esquinas comunes, sin espacio entre paneles. Cada panel
se abre de forma independiente. El contenedor de `UnlockedLesson` dibuja las divisiones; los
paneles reciben `grouped` para omitir sus bordes, esquinas y márgenes exteriores. Si no hay
recursos, el bloque conserva el mismo contorno. El botón de finalización se muestra solo con sesión.
Dentro del desplegable, Recursos usa una tabla de archivo y enlace.
Navegación mantiene los botones de lección anterior y siguiente; en la última lección,
la acción siguiente abre el examen o el certificado si el curso está completo.
El formulario de comentarios conserva el borrador al cerrar y volver a abrir la tarjeta.
Los paneles de Recursos, Comentarios y Transcripción se abren y cierran con una
transición breve de altura y opacidad; esta animación se desactiva si el sistema prefiere
movimiento reducido. Comentarios mantiene su contenido montado y no interactivo mientras
está cerrado para conservar el borrador.

Los IDs externos de los videos de ejemplo deben sustituirse por contenido real para probar reproducción. El progreso de segundos de video aún no está conectado al reproductor; marcar lección completa sí está implementado.

`LockedLesson` usa `StatusMessage` de `arxatec-ui` para el candado, título y descripción.
Sus props `classNameCard`, `classNameIconCard`, `classNameTitle` y `classNameDescription`
mantienen la presentación centrada, los colores neutros y el tamaño del bloque anterior.
Las acciones de registro y acceso conservan el destino de retorno; el temario sigue debajo.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
