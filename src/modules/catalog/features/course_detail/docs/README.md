# Ficha de curso

La ruta pública `/cursos/:slug` carga la ficha y temario mediante `useCourse`. `pages/` solo compone el encabezado y `CourseContent`; este resuelve estados con `AsyncBoundary`. La vista separa resumen, botón de inicio y temario.

Si el curso no existe, el 404 de la consulta llega al límite de rutas y muestra la
página 404 completa, igual que una URL desconocida. La URL del curso se conserva;
el estado no se incrusta dentro del layout de la ficha.

`PageShell` mantiene la navegación compartida. El resumen presenta título, descripción y datos
una sola vez; la tarjeta lateral usa la portada de Pexels como fondo y coloca la acción principal
sobre un degradado en la parte inferior. En escritorio su altura sigue la del resumen;
en pantallas pequeñas se apilan. `LessonList` muestra el temario con filas completas que se pueden abrir y
comparte su estructura con la lección bloqueada.

El nivel conserva su etiqueta traducida y añade un SVG de 20 px con tres barras gruesas,
con una barra activa para Introductorio y dos para Intermedio. Usa el color de primer
plano del tema y mantiene visibles las barras restantes al 25 % de opacidad. Es decorativo.
Los tres indicadores del resumen usan iconos de 20 px y se centran verticalmente con
sus etiquetas; cada pareja se mantiene unida cuando la fila se adapta a móvil.

El botón de inicio inscribe al estudiante autenticado mediante `useEnrollCourse` antes de navegar a la primera lección. Un visitante navega a la primera lección, donde el backend determina si es una muestra libre o devuelve `LESSON_LOCKED`. Las mutaciones se muestran con `toast.promise`; progreso invalida la caché de Mis cursos. `services/` adapta snake_case y sus pruebas están en `src/__tests__/modules/catalog/services/`.

Si el curso publicado no tiene lecciones, el temario ofrece el formulario compartido de avisos con `courseSlug`. Así la inscripción se asocia a ese curso, mientras el mismo formulario sin slug sirve para el aviso general del catálogo.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.

Después del temario, `CourseTeacher` muestra la foto, el nombre completo y la biografía del
docente asignado. Lee `course.teacher` de la ficha; el adaptador convierte `full_name` y
`photo_url` a camelCase. Si el curso no tiene docente, se omite el bloque. La foto usa `Avatar`
con iniciales como respaldo y la biografía conserva sus saltos de línea.

## Examen y certificado

La ficha incluye `CourseCertification`, compartido con la lección. Con sesión y todas las
lecciones completadas según Mis cursos, muestra «Dar examen para obtener mi certificado».
Si el certificado ya fue emitido, muestra «Ver certificado». No ofrece el examen de otro curso
ni considera terminado un curso sin lecciones. Las respuestas correctas nunca se consultan
desde esta invitación.
