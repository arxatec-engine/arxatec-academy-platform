# Feature `course_catalog` — `/`

**Estado: placeholder.** El brief habla de "Ir al catálogo" pero no define el catálogo, que llega
con la fase 14. Esta pantalla existe porque `/` tiene que resolver a algo y porque es el destino
por defecto de `<Guest>`, del enlace de la pantalla de error y de "Seguir sin cuenta" en E7.

| Cosa | Dónde |
| --- | --- |
| Ruta | `ROUTES.home` · `RouteHelpers.home()` · árbol `app_routes`, público |
| Claves i18n | `common.catalog.*`, `common.app.*` |

Es pública: el contrato es explícito en que ver los cursos no exige sesión, y la verificación de
correo solo hace falta para comentar. Cuando llegue el catálogo real, esta carpeta se sustituye sin
tocar `routes.ts`.
