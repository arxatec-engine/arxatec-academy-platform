# Progreso del estudiante

`/mis-cursos` requiere sesión y consulta `GET /me/courses`. Presenta cursos en progreso y terminados, cantidad de lecciones completadas y la siguiente lección disponible.

Desde la ficha de curso, la cuenta puede inscribirse antes de empezar. En una lección, puede marcar o desmarcar la finalización. Los hooks llaman a los servicios autenticados y invalidan `PROGRESS_KEYS.all` para mantener sincronizada la lista de cursos.

El contrato muestra totales devueltos por el backend. El cliente no calcula matrícula, certificaciones ni métricas de consumo. `saveLessonPosition` existe en servicios, pero no se consume desde un hook o reproductor hoy.

Detalle en `src/modules/progress/features/my_courses/docs/README.md` y pruebas relacionadas bajo `src/__tests__/modules/progress/`.
