# Fundamentos del producto

## Para quién

Academy ofrece formación gratuita en legal tech, especialmente para profesionales del derecho en Perú. La experiencia empieza en el catálogo público: permite descubrir y abrir cursos antes de crear una cuenta. La cuenta permite inscribirse, avanzar, consultar Mis cursos y comentar cuando el correo está verificado.

La plataforma combina un espacio de aprendizaje con herramientas de personal administrador. Las páginas `/admin` organizan cursos y lecciones, moderan la conversación, consultan el directorio de estudiantes y gestionan solicitudes de avisos. No se ofrecen en las cuentas `STUDENT` y no definen la navegación principal de estudiantes.

## Responsabilidades del frontend

- Mostrar las respuestas del servicio Academy mediante contratos tipados y estados de carga, error y ausencia de resultados.
- Guiar el acceso de visitante, el alta de cuenta y el retorno al contenido que intentaba abrir.
- Enviar cambios de progreso o perfil a la API autenticada y reflejar las respuestas confirmadas.
- Traducir toda la interfaz a español, inglés y portugués.
- Respetar roles y presentar acciones disponibles. La autorización y las reglas de negocio también las aplica el backend.

El cliente no es fuente de verdad para permisos, inscripción, publicación, moderación ni verificación de correo. Ocultar un enlace o cubrir una ruta con un guard no reemplaza la autorización del servicio.

## Fuentes

- Pantallas y módulos reales: `src/routes`, `src/modules` y sus documentos de feature.
- Contratos de servicio: repositorio hermano `arxatec-academy-service`.
- Variables de arranque: `.env.example` y `src/config/env`.

Si un documento planea una capacidad y el código no la implementa, debe presentarla como pendiente.
