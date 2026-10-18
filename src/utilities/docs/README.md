# `src/utilities` — helpers puros

Tres unidades, todas sin React y sin estado: `cn`, `query` y `redirect`.

## El barril no reexporta `query`, y es a propósito

`src/utilities/index.ts:1-2` solo reexporta `./cn` y `./redirect`. `@/utilities` se importa desde
casi cualquier componente para usar `cn`, así que **todo lo que cuelgue del barril viaja al chunk
compartido**. En el producto hermano el barril acabó reexportando el editor de texto rico y sus
dependencias, y el code splitting se rompió en silencio: la app seguía funcionando, solo que el
primer chunk pesaba megabytes (`CLAUDE.md` §14, punto 3).

Regla para quien añada un helper aquí: **si arrastra una dependencia de node_modules que no sea
trivial, no entra en el barril**. Se importa por su ruta:

```ts
import { createQueryClient } from "@/utilities/query";
```

## `cn` (`cn/index.ts:4`)

`clsx` resuelve condicionales; `twMerge` deduplica utilidades de Tailwind que compiten
(`p-2 p-4` → `p-4`). Sin `twMerge`, la clase que gana depende del orden en el CSS generado, no del
orden en que se escribió el `className`, y un override desde fuera del componente deja de funcionar
sin aviso.

## `query` (`query/index.ts`)

Fábrica del cliente de React Query, no un singleton: `Core` lo crea con
`useState(() => createQueryClient())` (`harness/03_reglas_frontend.md` §10) y cada test crea el
suyo. Un singleton de módulo haría que un test heredase la caché del anterior.

La configuración común define estos valores
(`harness/03_reglas_frontend.md` §6):

| Opción                 | Valor                                     | Por qué                                                                                    |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `staleTime`            | `30_000` (`query/index.ts:5`)             | con `0`, navegar entre pantallas que comparten `queryKey` dispara una petición por montaje |
| `refetchOnWindowFocus` | `false`                                   | volver a la pestaña recargaba de golpe todo lo montado                                     |
| `retry`                | `shouldRetryRequest` (`query/index.ts:8`) | 2 intentos, **nunca en 4xx**                                                               |
| `throwOnError`         | Solo errores HTTP 404 normalizados       | permite al límite de rutas mostrar el mismo 404 completo que una URL desconocida           |

`shouldRetryRequest` usa `isClientError` (`src/interceptors/api_error/index.ts:29`): un 401, un 409
o un 422 no se arreglan repitiendo la petición, y tras un 401 el interceptor ya cerró la sesión —
reintentar solo añade dos peticiones muertas y dos segundos de espera. Las mutaciones no reintentan
nunca: repetir un `POST /auth/register` crearía dos cuentas.

Los 404 de consultas se propagan a `RouteErrorBoundary`, que sustituye la página
por `NotFoundPage` sin cambiar la URL. Los demás estados siguen disponibles para
el componente que consulta. Las mutaciones conservan su feedback de formulario o toast.

La importación apunta a `@/interceptors/api_error` y no a `@/interceptors` para no crear un ciclo:
el barril de interceptores importa `@/utilities/redirect`.

## `redirect` (`redirect/index.ts`)

`isSafeRedirectPath` (`redirect/index.ts:14`) es la mitad frontend de la regla del contrato §7: el
destino de retorno **siempre** es un path relativo. Un `redirect_to=https://malo.pe` convierte el
login en un redirector abierto, que es el clásico del phishing con dominio legítimo en la barra.

Se rechaza lo que no empieza por `/`, los prefijos `//`, `/\` y sus formas escapadas
(`redirect/index.ts:1`), y cualquier carácter de control o espacio (`redirect/index.ts:6`): el
navegador interpreta `//malo.pe` como `https://malo.pe`, y un `\` en el prefijo hace lo mismo en
varios navegadores. La misma función pura existe en el backend y se testea en los dos lados.
