# Administración de cursos

Rutas privadas para rol `ADMIN`: `/admin/cursos` muestra el listado, `/admin/cursos/nuevo` abre el diálogo de creación y `/admin/cursos/:id` abre el editor en un diálogo sobre el listado. La guardia de navegación anticipa el rol; el backend protege todos los endpoints. `services/` transporta el contrato, `hooks/` invalida tanto lista administrativa como catálogo público tras cambios y `pages/` solo compone.

La actualización envía `expected_updated_at` para evitar sobrescribir una edición concurrente; tras éxito se usa el nuevo timestamp. Archivar exige confirmación porque oculta el curso del catálogo. El temario permite crear y reordenar lecciones y despliega su editor dentro del mismo paso.

El listado muestra «Crear curso» en la misma cabecera que el título, sin descripción.
El título de cada curso abre su editor; las tarjetas no incluyen un botón «Editar».
Cada tarjeta tiene un `Separator` de ancho completo entre su contenido y el pie; el
relleno se aplica a esas dos zonas, dejando la línea junto a los bordes laterales.
La tarjeta permite arrastrar y soltar directamente, solo en vertical, mediante
`@dnd-kit/react`, con ratón, táctil o teclado. No incluye un icono ni un asa independiente.
Los enlaces y botones mantienen sus acciones y no inician el arrastre. Con el foco en
la tarjeta, Espacio/Intro inicia y suelta; las flechas arriba/abajo desplazan y Escape
cancela. Se conservan los botones Subir/Bajar y los anuncios se traducen.

`useCourseSorting` mantiene estable la lista durante el arrastre y guarda al soltar,
enviando la lista completa de IDs activos a `PUT /admin/courses/order`. El nuevo orden
se muestra mientras guarda; ante un error se restaura el anterior. Los cursos archivados
quedan al final y fuera del orden editable. Los controles se deshabilitan mientras se
guarda y una lista con menos de dos cursos activos no permite arrastrar.

La interfaz usa `AdminPage` sobre `PageShell`, con navegación discreta y títulos de peso normal, como el catálogo. Crear y editar abren el mismo diálogo de seis pasos desde el inicio: información, docente, portada, lecciones, examen y publicación. `CourseSetup` muestra una etapa a la vez, con pestañas numeradas, contador de paso y navegación anterior/continuar. El contenido no repite el título ni la descripción de cada paso; su nombre accesible se conserva y el contador recibe el foco al cambiar de etapa. Al crear, «Guardar y continuar» del primer paso envía título, descripciones, tema y nivel; el borrador resultante se conserva en caché y el mismo diálogo avanza a docente. No hay un formulario preliminar ni una pantalla separada. Los otros pasos se habilitan tras guardar la información inicial. Docente, portada y examen se pueden completar después. Los controles de orden usan iconos con nombre accesible. La vista previa de portada usa `Image` y los campos se adaptan al ancho disponible.

El formulario de cada paso se presenta directamente en el diálogo, sin una tarjeta
adicional con borde, fondo o relleno alrededor. El espaciado exterior lo aporta el diálogo.
El diálogo define `--admin-content-padding` y cada lección desplegada lo ajusta a su propio
relleno. Los separadores compensan ese espacio para llegar de borde a borde, manteniendo
el relleno de los campos y botones tanto en móvil como en escritorio.
Todos los pasos comparten una línea superior antes del formulario y una inferior antes
de los botones de navegación.

El paso actual se conserva en `?paso=...`; los valores desconocidos abren información.
La lección desplegada se conserva en `?paso=lessons&leccion=...`. Los paneles se montan al visitarlos y
permanecen montados al cambiar de paso, para conservar los cambios locales, incluida la
portada seleccionada y las preguntas incompletas. Información y docente guardan antes de
avanzar; portada sube el archivo seleccionado antes de continuar. Un error conserva el
contenido y el paso actual. La navegación se deshabilita mientras se guarda.

Cada lección usa `Collapsible` y carga su detalle al desplegarse. Solo un editor queda
visible a la vez; los ya visitados permanecen montados al plegar o cambiar de paso, para
conservar campos y archivos seleccionados. Crear una lección actualiza la lista y abre su
editor con el foco en el título. Contenido, recursos, publicación y borrado se resuelven
dentro del desplegable, sin salir del diálogo del curso. Los cambios pendientes de todas
las lecciones, recursos y formulario de creación se agregan a la revisión final del curso.
Un fallo de carga permite reintentar dentro de la propia lección.

Información y docente guardan sus propios campos usando los valores guardados del otro
paso y el último `updated_at` conocido, incluida una subida de portada. La revisión final
muestra el resumen guardado y las lecciones publicadas; `can_publish` del servidor sigue
autorizando la publicación. Los cambios locales pendientes bloquean publicar y finalizar,
y ofrecen volver al paso correspondiente o descartarlos. Este borrador local se conserva
entre pasos de la misma pantalla; solo lo guardado en el servidor sobrevive al salir o recargar.

`CourseDialog` usa `ScrollArea` de `arxatec-ui` para desplazar los pasos y las lecciones
dentro de la altura disponible del diálogo, manteniendo visible el botón de cierre.
Mantiene el formulario abierto mientras solicita confirmar su cierre.
La X, Escape, el clic fuera, el botón para volver y las navegaciones a otra pantalla
(incluido Atrás del navegador) pasan por `useBlocker` y un diálogo
de confirmación. «Seguir editando» cancela la navegación y conserva todos los paneles;
«Sí, cerrar» continúa a la ubicación solicitada. Desplegar lecciones, cambiar de paso, pasar del borrador recién
creado al editor y duplicar un curso mantienen el flujo en un diálogo sin pedir cerrar.
La creación reemplaza su entrada de historial para que Atrás vuelva al listado. Las rutas
de creación y edición comparten la misma página diferida y el diálogo permanece montado
cuando la URL pasa de `/nuevo` al ID del borrador.

Mientras el diálogo está abierto, `useBeforeUnload` solicita la confirmación nativa al
cerrar o recargar la pestaña; su texto y disponibilidad dependen del navegador. La
aplicación no puede mostrar un diálogo React durante el cierre de una pestaña. El aviso
se retira al desmontar el editor. Los cierres se deshabilitan mientras se guarda.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.

El formulario del curso permite crear un docente o elegir uno de `GET /admin/teachers`.
Sus tres campos son nombre completo, biografía y URL de foto. El guardado existente envía
`teacher` junto con `expected_updated_at`; una selección nula desasigna al docente sin borrarlo.
Editar un docente existente actualiza su perfil compartido entre cursos. Tras guardar un
docente nuevo se conserva su id para que las siguientes ediciones no creen duplicados.
Los inputs usan `size="sm"` y los campos incluyen placeholders traducidos.

Cada curso incluye «Examen para el certificado»: 15 preguntas con cuatro opciones y una
respuesta correcta, nota mínima (12 por defecto) y activación. Los controles proceden de
`arxatec-ui`; las preguntas se despliegan de una en una con `Collapsible`. Se exige completar
las 15 para guardar. GET/PUT de `/admin/courses/:id/exam` requieren ADMIN también en el
servidor; el guardado envía `expected_version` y conserva los cambios ante errores o conflictos.
Un conflicto ofrece recargar la versión actual. Los cursos archivados tienen el formulario
deshabilitado. Modificar el examen no revoca los certificados ya emitidos.
