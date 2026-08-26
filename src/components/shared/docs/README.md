# `src/components/shared`

Componentes de dominio que cruzan módulos. Los átomos que no están en `arxatec-ui` van a
`components/ui/`; los providers y layouts, a `components/layout/`.

| Componente | Para qué |
| --- | --- |
| `theme_selector` | Los tres modos de tema (sol / luna / monitor), con `aria-pressed`. |
| `language_selector` | Los tres idiomas (ES / EN / PT), con `aria-pressed`. |
| `loading_screen` | Splash a pantalla completa con el isotipo. |
| `error_screen` | Pantalla de error: 404 y fallo inesperado, con acción al lado. |

Los dos selectores son `role="group"` con `aria-label` traducido y un botón por opción con
`aria-pressed`: es un grupo de estados, no un menú, y así se navega con Tab sin abrir nada. El
texto visible va duplicado en un `sr-only` con el nombre largo, porque "ES" o un icono de luna no
dicen nada leídos en voz alta.

Las variantes se eligen con **mapas explícitos de literales** (`theme_selector/index.tsx:17`,
`error_screen/index.tsx:16`) porque las claves de i18n son tipadas y `t(variable)` no compila.

`error_screen` acepta un `onRetry` opcional (`error_screen/index.tsx:31`). Sin él la única acción es
el enlace al catálogo, que es lo que necesita un 404: recargar la misma URL inexistente no arregla
nada. Con él —el caso del guard `<Auth>` cuando `GET /auth/me` falla con un `500` o sin red— la
acción principal pasa a ser "Volver a intentarlo" (`common.actions.retry`) y el catálogo baja a
secundaria: la regla del brief es que cada vacío traiga **la** acción siguiente al lado
(`harness/05_diseno_y_ux.md` §5), y ahí la siguiente es reintentar, no irse.

`error_screen` es *eager*: lo usa el `errorElement` del router y el catch-all `*`, así que no puede
depender de un chunk que quizá no cargue. `loading_screen` es el `fallback` de todos los
`<Suspense>` de `lazyPage`, y por eso pinta su propio fondo con `bg-background`: si fuera
transparente, el salto entre chunks se vería como un parpadeo blanco en tema oscuro.

`LoaderSplash` de `arxatec-ui` se descartó a propósito: su prop `size` está **en rem** (default
`2.5`), lleva su propio `h-screen w-screen` —que provoca scroll horizontal cuando hay barra de
scroll— y su `aria-label` es un literal en español que no pasa por i18n.
