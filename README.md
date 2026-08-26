# Arxatec Academy — frontend

SPA de React 19 + TypeScript sobre Vite. Habla con `arxatec-academy-service` por REST.
Las reglas del proyecto están en `harness/` (fuera de este repo): estructura, contrato de API,
diseño y gates.

## Requisitos

- Node 24
- **pnpm** (fijado en `packageManager`). Nada de `npm run` ni `npx`; para ejecutables sueltos,
  `pnpm dlx`.

## Arranque

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`VITE_API_URL` es la única variable del frontend y apunta a `http://localhost:3001/api/v1` en
desarrollo. Se lee **solo** desde `src/config/env`; el bundle es público, así que ahí no va ningún
secreto.

## Gates

```bash
pnpm lint
pnpm typecheck        # tsc -b --noEmit
pnpm test:unit        # vitest run
pnpm build            # tsc -b && vite build
```

## Documentación

| Documento | Qué cuenta |
| --- | --- |
| `docs/ARCHITECTURE.md` | El mapa del módulo de auth: capas, qué comparten las 7 pantallas, chunks del build y lo que falta del contrato. |
| `docs/I18N.md` | La convención de claves, los 12 `meta.code` y su clave, y cómo se añade un texto en los tres idiomas. |

## Mapa rápido

| Carpeta | Qué hay | Documentación |
| --- | --- | --- |
| `src/config/env` | única lectura de `import.meta.env` | — |
| `src/constants` | claves de almacenamiento y `meta.code` del contrato | — |
| `src/types` | sobre `Response<T>` y tipos `Api*` en `snake_case` | — |
| `src/interceptors` | las dos instancias de axios y `ApiError` | `src/interceptors/docs/README.md` |
| `src/services/auth_storage` | token, usuario y destino de retorno | `src/services/auth_storage/docs/README.md` |
| `src/utilities` | `cn`, cliente de React Query, validación de `redirect_to` | `src/utilities/docs/README.md` |
| `src/store` | zustand: usuario y tema | — |
| `src/routes` | `ROUTES` y `RouteHelpers`: la fuente única de paths | `src/routes/docs/README.md` |
| `src/modules/auth` | las 7 pantallas del login y lo que comparten | `src/modules/auth/docs/README.md` |
| `src/__tests__` | espejo de `src/` | — |

## Estilos

`src/index.css` importa `arxatec-ui/styles.css` **antes** que cualquier estilo propio: al revés,
los overrides pierden la puja de especificidad. La línea
`@source "../node_modules/arxatec-ui/dist/**/*.js"` mantiene vivas en producción las clases que
solo aparecen dentro de la librería.

Solo se usa la tipografía **sans** de `arxatec-ui`, y los colores salen siempre de las clases
semánticas de los tokens (`bg-background`, `text-muted-foreground`, `border-border`…).
