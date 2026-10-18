# Arxatec Academy — frontend

SPA educativa de React 19 y TypeScript sobre Vite. Se conecta por REST con `arxatec-academy-service` y ofrece catálogo público, cursos y lecciones, progreso, comentarios, gestión de cuenta y herramientas restringidas para administradores.

La documentación de esta aplicación empieza en [`docs/README.md`](docs/README.md). `src/` y los contratos del servicio definen el comportamiento implementado.

## Requisitos

- Node 24
- **pnpm** (fijado en `packageManager`). Usa los scripts disponibles en `package.json`.

## Arranque

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`VITE_API_URL` apunta a `http://localhost:3001/api/v1` por defecto. Se lee solo desde `src/config/env`; su valor forma parte del bundle público, así que no admite secretos.

## Verificación

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

## Mapa rápido

| Carpeta                     | Qué contiene                                        | Documentación                                             |
| --------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| `src/config/env`            | lectura única de configuración Vite                 | [`docs/ENV.md`](docs/ENV.md)                              |
| `src/interceptors`          | instancias Axios autenticada y pública, errores API | `src/interceptors/docs/README.md`                         |
| `src/services/auth_storage` | sesión y destino de retorno                         | `src/services/auth_storage/docs/README.md`                |
| `src/routes`                | paths centralizados y árboles de rutas              | `src/routes/docs/README.md`                               |
| `src/modules/auth`          | acceso, registro, correo y recuperación             | `src/modules/auth/docs/README.md`                         |
| `src/modules/catalog`       | catálogo, fichas y lecciones                        | README en cada feature                                    |
| `src/modules/progress`      | Mis cursos y progreso                               | `src/modules/progress/features/my_courses/docs/README.md` |
| `src/modules/comments`      | conversación de lecciones                           | `src/modules/comments/docs/README.md`                     |
| `src/modules/profile`       | perfil y cuenta                                     | `src/modules/profile/features/profile/docs/README.md`     |
| `src/modules/admin`         | gestión de cursos, estudiantes, avisos y moderación | README en cada feature                                    |
| `src/__tests__`             | pruebas unitarias de servicios, hooks, rutas y UI   | [`docs/TESTING.md`](docs/TESTING.md)                      |

Tailwind CSS 4 y `arxatec-ui` proporcionan estilos, componentes y tokens visuales. `src/index.css` carga primero el CSS del paquete; `@source "../node_modules/arxatec-ui/dist/**/*.js"` detecta las clases que usa la librería.
