# Invitación al examen y certificado

El componente usa el progreso persistido de Mis cursos mediante `useCompletedCourse`. Se
comparte entre la ficha y la lección para que completar el curso deje una acción visible:
«Dar examen para obtener mi certificado». Las lecciones pendientes, otro curso completado,
los cursos sin lecciones y los visitantes no muestran esa invitación.

Si existe `certificateId`, la acción cambia a «Ver certificado». Las mutaciones de progreso
y envío del examen invalidan la misma familia de React Query. El backend valida de nuevo
las lecciones y la calificación antes de emitir el certificado; el cliente solo ofrece navegación.
La consulta se desactiva sin usuario y no contiene respuestas correctas del examen.

Las pruebas del componente verifican el progreso inicial guardado, completar/desmarcar la
última lección, la ausencia de solicitudes anónimas y el acceso al certificado emitido.
