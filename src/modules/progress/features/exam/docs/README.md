# Examen final

Ruta privada `/cursos/:slug/examen`. Se ofrece desde Mis cursos cuando se completaron las
lecciones y todavía no existe certificado, y desde la última lección recién completada.
`GET /courses/:slug/exam` determina acceso, versión, preguntas y último resultado. Los estados
de carga, error recuperable, examen no disponible, progreso pendiente y certificado existente
tienen presentación propia. El contenido usa `PageShell` (`max-w-3xl`) y títulos de hasta `text-2xl`.

El examen presenta 15 preguntas con cuatro opciones en botones con radio de `arxatec-ui`.
Muestra la nota mínima configurada (12/15 por defecto), el contador y el progreso de respuestas;
el envío exige responderlas todas. Solo manda versión e índices seleccionados: la corrección y
emisión del certificado pertenecen al servidor. Tras desaprobar permite otro intento; tras
aprobar ofrece el certificado público y actualiza Mis cursos.

Un fallo de red conserva las respuestas mientras la pantalla está abierta. `EXAM_CHANGED`
pide recargar, sin corregir silenciosamente con preguntas nuevas. El componente se reinicia
cuando cambia la versión; no almacena la clave correcta ni fabrica resultados en el navegador.
Todos los textos admiten español, inglés y portugués. Las pruebas de interacción cubren envío
incompleto, nota del servidor, desaprobado, reintento, error de red y cambio de versión.
