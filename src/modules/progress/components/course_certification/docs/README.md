# Invitación al examen y certificado

El componente usa el progreso persistido de Mis cursos mediante `useCompletedCourse`. Se
usa debajo del temario en la ficha del curso. La sección «Examen» usa el mismo tamaño de título
que «Temario» y una tarjeta enteramente clickeable con icono, «Examen final», descripción de
las 15 preguntas y «Dar examen» con flecha. Las lecciones pendientes, otro curso completado,
los cursos sin lecciones y los visitantes no muestran esa invitación.

La última lección usa el mismo hook para ofrecer «Dar examen» en su navegación inferior,
sin mostrar el aviso de este componente encima del contenido.

Si existe `certificateId`, la acción cambia a «Ver certificado». Las mutaciones de progreso
y envío del examen invalidan la misma familia de React Query. El backend valida de nuevo
las lecciones y la calificación antes de emitir el certificado; el cliente solo ofrece navegación.
La consulta se desactiva sin usuario y no contiene respuestas correctas del examen.

Las pruebas del componente verifican el progreso inicial guardado, completar/desmarcar la
última lección, la ausencia de solicitudes anónimas y el acceso al certificado emitido.
