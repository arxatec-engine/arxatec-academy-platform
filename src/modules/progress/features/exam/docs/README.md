# Examen final

Ruta privada `/cursos/:slug/examen`. Se ofrece desde Mis cursos cuando se completaron las
lecciones y todavía no existe certificado, y desde la última lección recién completada.
`GET /courses/:slug/exam` determina acceso, versión, preguntas y último resultado. Los estados
de carga, examen no disponible, progreso pendiente y certificado existente tienen presentación
propia. Un fallo al cargar el examen muestra la página de error compartida con el 404, con su
mensaje correspondiente. El contenido usa `PageShell` (`max-w-3xl`) y títulos de hasta `text-2xl`.

El examen presenta una de sus 15 preguntas por pantalla, con cuatro opciones en botones con
radio de `arxatec-ui`. La pregunta ocupa el espacio principal de la página y la navegación
aparece debajo. «Siguiente» exige seleccionar una opción; «Anterior» permite revisar y cambiar
respuestas sin perder las demás. Al cambiar de pregunta, el foco vuelve al enunciado. El
contador «Pregunta N de 15» y el progreso de respuestas mantienen visible el avance. La nota
mínima configurada (12/15 por defecto) aparece antes de comenzar.

«Enviar examen» aparece únicamente en la última pregunta y exige responderlas todas, también
al enviar con teclado. Solo manda versión e índices seleccionados, en el orden original: la
corrección y emisión del certificado pertenecen al servidor. La navegación y las opciones se
bloquean mientras se corrige. Tras desaprobar permite otro intento desde la primera pregunta,
sin respuestas anteriores; tras aprobar ofrece el certificado público y actualiza Mis cursos.

Un fallo de red conserva las respuestas mientras la pantalla está abierta. `EXAM_CHANGED`
pide recargar, sin corregir silenciosamente con preguntas nuevas. El componente se reinicia
cuando cambia la versión; no almacena la clave correcta ni fabrica resultados en el navegador.
Todos los textos admiten español, inglés y portugués. Las pruebas de interacción cubren una
pregunta visible, navegación con respuestas conservadas, foco, envío incompleto o anticipado,
orden de respuestas, nota del servidor, bloqueo durante corrección, desaprobado, reintento,
error de red y cambio de versión.

## Entrada desde el curso terminado

`useCompletedCourse` comparte la consulta de Mis cursos entre la ficha, la lección y la marca
de finalización. `CourseCertification` ofrece una acción con texto al terminar todas las
lecciones; sigue disponible tras recargar. La consulta privada se desactiva para visitantes.
Marcar/desmarcar invalida el progreso y habilita/retira la invitación. Aprobar sigue siendo
responsabilidad del backend; un curso completo sin examen aprobado aún no tiene certificado.
Tras aprobar, el resultado permite abrir el certificado y la consulta renovada ofrece verlo
en el curso. La nota mínima es la configuración del examen, no un valor impuesto por el botón.
