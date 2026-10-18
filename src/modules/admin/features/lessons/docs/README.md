# Administración de lecciones

En el paso «Lecciones» del diálogo del curso se crean lecciones VIDEO o ARTICLE y se ordenan con la lista completa de IDs. Cada título despliega `AdminLessonEditor`, compartido en `modules/admin/components/lesson_editor`, para editar descripción, muestra gratuita, contenido, transcripción, recursos y estado dentro del mismo diálogo. La ruta anterior `/admin/lecciones/:id` carga la relación con el curso y redirige a `/admin/cursos/:id?paso=lessons&leccion=:lessonId`, con esa lección abierta. El formulario conserva el proveedor existente o inicializa YouTube; Vimeo sigue disponible. `POST /admin/videos/probe` comprueba el ID, pero YouTube exige duración manual al guardar/publicar porque oEmbed no la entrega. El backend vuelve a validar y sanea artículos.

Cambiar el tipo con contenido exige una confirmación visible y `confirm_type_change`; borrar un borrador exige un diálogo que informa del posible borrado de progreso/comentarios y envía `confirm_destroys_student_data`. Una lección publicada se despublica antes de borrarse. Las mutaciones actualizan el detalle y el resumen del curso en caché e invalidan curso, temario y catálogo público según la operación. Borrar retira la fila sin navegar. Los recursos se suben multipart, se renombran, borran con confirmación y reordenan mediante la lista completa de IDs.

Los desplegables visitados mantienen sus formularios montados y ocultos al plegarse para conservar los borradores y archivos. Cada campo usa un ID propio para evitar duplicados entre editores. Los cambios de contenido y recursos se agregan por lección y bloquean publicar hasta guardar; también se comunican al asistente del curso. Guardar una parte no limpia los cambios pendientes de otra. Los fallos de guardado conservan el formulario y un fallo de carga ofrece reintentar dentro del desplegable.

Los recursos y acciones se separan con líneas discretas. Los campos de video y la carga de recursos se distribuyen en columnas cuando hay espacio. El editor de HTML usa tipografía sans. Los controles de orden tienen nombres accesibles y se conservan las confirmaciones y condiciones de publicación.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
