# Comentarios de lecciones

El hilo es público, pero publicar o responder requiere sesión y correo verificado. Un usuario con sesión puede reportar un comentario. El backend valida estas reglas; la interfaz solo anticipa el resultado.

`components/lesson_comments` compone el formulario, los hilos y los estados `AsyncBoundary`. Cada acción pasa por `hooks/` (React Query), `services/` (Axios) y `adapters/` (snake_case a camelCase). Los hooks invalidan el hilo después de crear o responder. El reporte no altera el hilo público; deshabilitamos la opción localmente después del éxito. Los mensajes visibles están en `i18n/` y en los tres `common.json`.

El contrato limita cada cuerpo a 2000 caracteres. Las pruebas de transporte están en `src/__tests__/modules/comments/services/`.

El bloque de comentarios es una tarjeta plegable de `arxatec-ui`. En la lección recibe
`grouped` y comparte el contorno con Tu avance y Recursos, sin márgenes ni bordes duplicados;
el contenedor mantiene las esquinas correctas cuando falta alguno de estos paneles.
El contenido se oculta al cerrar la tarjeta, pero sigue montado para conservar el
borrador del formulario. Los hilos mantienen sus propias tarjetas con
autor y acciones alineados. Sin sesión o con el correo pendiente de verificar, se muestra
un `StatusMessage` con el motivo y un botón para iniciar sesión o verificar el correo.
En esos estados se ocultan el formulario, la invitación a participar y el mensaje de hilo vacío;
los comentarios publicados siguen visibles. Las respuestas abiertas también se ocultan si se
pierde el permiso de publicación. Los errores al cargar el hilo usan `StatusMessage` y ocultan
la invitación a participar. La carga utiliza un único `Skeleton` simple.
