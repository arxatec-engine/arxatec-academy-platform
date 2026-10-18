# `ThemeBootstrap` y el tema claro / oscuro

`arxatec-ui` declara `@custom-variant dark (&:is(.dark *))` y define los tokens oscuros bajo
`.dark` (`node_modules/arxatec-ui/dist/styles.css:437` y `:1969`). Por eso el tema es **una clase
en `<html>`**, no estado de React: el CSS reacciona solo y no se recalcula nada en JS.

## Reparto

| Pieza                                  | Responsabilidad                                                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/store/theme`                      | `mode: light \| dark \| system` (default `system`), persistido en `LOCAL_STORAGE_KEYS.THEME_MODE`.                         |
| `src/utilities/theme`                  | `resolveTheme(mode)` y `applyResolvedTheme(theme)`: aplica `classList`, `style.colorScheme` y el favicon al tema resuelto. |
| `src/hooks/use_darkmode`               | Escucha `prefers-color-scheme` **en vivo** con `matchMedia().addEventListener` y reaplica.                                 |
| `ThemeBootstrap`                       | Monta el hook una vez, dentro de `<Core>`. No pinta nada propio.                                                           |
| `src/components/shared/theme_selector` | Los tres botones (sol / luna / monitor) con `aria-pressed`.                                                                |

`useDarkMode` solo se suscribe a `matchMedia` cuando el modo es `system`
(`src/hooks/use_darkmode/index.ts:32`): en `light` o `dark` la preferencia del sistema es
irrelevante y suscribirse dejaría un listener que no hace nada.

## El script inline de `index.html` (y su trampa)

`index.html` aplica el tema **antes del primer pintado**. Sin él hay destello blanco en cada carga
y es de los bugs que solo se ven en producción. Comprobado en el build: en `dist/index.html` el
script queda **antes** del `<link rel="stylesheet">` y del módulo de la app, así que la clase está
puesta antes de que se parsee el CSS.

**Trampa:** ese script no puede importar `LOCAL_STORAGE_KEYS`, así que la clave
`"arxatec_academy.theme_mode"` está **escrita a mano** ahí. Si alguien cambia
`src/constants/local_storage/index.ts:4`, tiene que cambiar `index.html` en el mismo commit o
vuelve el destello — sin que falle ningún test, porque el script vive fuera del grafo de módulos.

El script cae a `system` ante cualquier valor raro y va envuelto en `try/catch` porque
`localStorage` lanza en modo privado de algunos navegadores.

## Favicon

`public/favicon.svg` usa el isotipo de Arxatec y se adapta al sistema sin JavaScript.
El enlace `#app-favicon` de `index.html` apunta inicialmente a ese archivo; el script
inicial selecciona `favicon_light.svg` o `favicon_dark.svg` según el modo guardado
y la preferencia del sistema, antes de montar React. `applyResolvedTheme` mantiene
el icono sincronizado al cambiar de modo o al cambiar el sistema en modo `system`.
Los tres SVG comparten los recursos de marca del panel de administración.
