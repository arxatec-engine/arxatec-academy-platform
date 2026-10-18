# Lecciones y materiales

La ficha de curso muestra el temario; una lección abre desde `/cursos/:course_slug/lecciones/:lesson_slug`. El endpoint de lección puede devolver el contenido completo o `403 LESSON_LOCKED` acompañado de una lista de temario. El servicio convierte ambas respuestas en una unión tipada y la pantalla presenta reproducción o una invitación a entrar/crear cuenta.

El contenido puede incluir video de YouTube o Vimeo, artículo HTML saneado por el backend, transcripción y recursos. Los iframes usan URLs de embed por proveedor, `loading="lazy"` y título accesible. El artículo se renderiza desde el contenido ya saneado que entrega la API; cualquier cambio del saneamiento debe coordinarse con el backend.

La navegación anterior/siguiente deriva de la respuesta del endpoint. Se puede marcar una lección como completada desde la interfaz cuando hay sesión. El servicio `saveLessonPosition` ya está declarado, pero no hay hook ni interacción de reproductor que lo utilice; no documentar el guardado automático de segundos como una capacidad visible.

La zona ADMIN permite editar cursos y lecciones, adjuntar recursos, publicar y ordenar contenido. Sus validaciones y operaciones se documentan en [Administración](../content_management/README.md) y en los README de `src/modules/admin/features/`.
