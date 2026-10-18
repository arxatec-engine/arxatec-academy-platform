# Mis cursos

Ruta privada `/mis-cursos`. `pages/` solo compone el encabezado y `MyCoursesContent`. El hook `useMyCourses` consulta `GET /me/courses`; `AsyncBoundary` maneja carga/error y el contenido muestra el vacío de producto. `MyCourseCard` usa `Progress` y `Button` de `arxatec-ui`, enlaza a la próxima lección o a la ficha y sirve a cursos en curso y terminados.

La mutación de inscripción y las marcas de lección invalidan la clave `PROGRESS_KEYS.all`, por lo que la lista se actualiza al volver. Las pruebas de servicio están en `src/__tests__/modules/progress/services/`.

Cuando el servidor devuelve `certificate_id`, la tarjeta añade «Ver certificado», que abre la
página pública `/certificados/:id` con verificación, QR y descarga PDF. Las acciones de la tarjeta
se agrupan horizontalmente con `ButtonGroup` de `arxatec-ui`. Se conserva el enlace si
un curso certificado vuelve a tener lecciones pendientes. El certificado lo emite el servidor
al aprobar el examen de 15 preguntas; el frontend no permite inventarlo ni modificar sus datos.
Un curso terminado sin certificado muestra «Dar examen» junto a «Volver a ver», dentro del
mismo `ButtonGroup`. Completar lecciones por sí solo no otorga el certificado.

`PageShell` y `PageHeading` reúnen navegación y el único encabezado de página, «Mis cursos».
Todos los cursos comparten una cuadrícula, primero los que están en curso y luego los terminados;
el estado se indica con el badge de cada tarjeta, sin encabezados ni contadores por grupo. Las tarjetas
mantienen alturas, separación y una acción principal consistente; distinguen continuar de
revisar un curso terminado y muestran el progreso con `Progress` de `arxatec-ui`.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
