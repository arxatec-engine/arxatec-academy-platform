# Página no encontrada

La ruta comodín `ROUTES.not_found` usa una página dedicada inspirada en el 404 de
`arxatec-public-web`: código pequeño, título de peso normal, una descripción breve y
una única acción para volver al inicio. `PageShell` aporta la cabecera, el pie y
el tema de Academy; el contenido queda centrado en el espacio disponible.

La página se importa de forma directa desde `error_routes`, sin carga diferida.
`RouteErrorBoundary` también la muestra cuando una consulta devuelve un 404 o los
parámetros de una ruta no permiten identificar el recurso. Sustituye la pantalla
completa, incluida la navegación administrativa, y conserva la URL solicitada.
Así `/cursos/ofds`, una lección inexistente y una ruta desconocida comparten el mismo
layout, centrado y acción de regreso. Los errores de conexión y de servidor siguen
su tratamiento habitual.

`NotFoundContent` contiene el diseño compartido. Los textos usan las claves tipadas
de `error_screen` en español, inglés y portugués. `useTitle` actualiza el título de
la pestaña. La animación de entrada solo se aplica cuando el sistema permite movimiento.
