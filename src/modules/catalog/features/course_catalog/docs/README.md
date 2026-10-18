# Feature `course_catalog` — `/`

**Estado: implementado.** La ruta `/` muestra cursos publicados del backend, con búsqueda,
filtros de tema/nivel y facetas devueltas por `GET /courses`.

| Cosa        | Dónde                                                               |
| ----------- | ------------------------------------------------------------------- |
| Ruta        | `ROUTES.home` · `RouteHelpers.home()` · árbol `app_routes`, público |
| Claves i18n | `common.catalog.*`, `common.app.*`                                  |

Es pública: ver cursos no exige sesión. `pages/` compone `PageShell`, `CatalogContent` e `InterestPanel`.
`useCatalogSearch` mantiene filtros en la URL; `useCatalog` incluye todos ellos en la clave de
React Query. `CatalogFilters` usa `Input` y dos `Select` de `arxatec-ui`, `CatalogCard` pinta cada
curso, y `services/` adapta la respuesta snake_case del backend.
La presentación prioriza los cursos: un único título, un campo de búsqueda y dos selectores de
tema y nivel en una sola fila horizontal, sin etiquetas visibles, antes de una cuadrícula de una,
dos o tres columnas. La búsqueda y los selectores muestran placeholders breves; sus nombres
accesibles se conservan. Los tres controles usan `size="sm"` de la librería. Las opciones
«Todos» dentro de cada selector quitan ese filtro.
Los selectores muestran un icono decorativo a la izquierda del placeholder y del valor:
capas para tema y barras ascendentes para nivel, alineados como el icono de búsqueda.
Las tarjetas completas son enlaces con foco visible; sus
portadas, títulos, descripciones, datos y acciones mantienen la
misma alineación.
Los selectores muestran las facetas cuando están disponibles y actualizan la URL de inmediato.
La búsqueda se aplica automáticamente tras 300 ms sin escribir, sin botón de envío. Al escribir,
el parámetro de búsqueda reemplaza la entrada actual del historial; los selectores conservan los
demás parámetros. Cada selector ofrece una opción «Todos» y el campo permite borrar el texto.
`CourseCover` comparte las fotos de Pexels con la ficha de curso. El enlace de cada tarjeta
tiene un nombre accesible que incluye el título, sin controles interactivos anidados.
El estado sin cursos y el error de carga usan `StatusMessage` de `arxatec-ui`; el error
mantiene visibles los filtros y el mensaje del fallo.
Durante la carga de cursos, `LoadingScreen` muestra un único bloque simple de `Skeleton`,
manteniendo la cabecera y los filtros visibles.

`InterestPanel` deja dos acciones al pie para abrir los formularios públicos de avisos y
sugerencias del módulo `notifications`. No se muestran ambos formularios durante la búsqueda.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.
