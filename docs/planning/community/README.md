# Comentarios y moderación

Los hilos de comentarios de lecciones se pueden leer públicamente. Crear un comentario o una respuesta requiere sesión y correo verificado, regla que el servicio vuelve a comprobar. Los cuerpos de la conversación son texto, no HTML proporcionado por el usuario.

Cada hilo consulta `GET /lessons/:id/comments`. Crear, responder y reportar un comentario usan endpoints autenticados. Los hooks actualizan el hilo luego de creación/respuesta; el reporte se refleja deshabilitando esa acción localmente después del éxito.

El área `/admin/comentarios`, accesible por rol `ADMIN`, ofrece listas de moderación, recuentos y acciones para responder, ocultar, volver a mostrar o borrar. El backend conserva la autoridad sobre estado, rol y restricciones.

Revisa `src/modules/comments/docs/README.md`, `src/modules/admin/features/moderation/docs/README.md` y el servicio al modificar políticas, texto o retención.
