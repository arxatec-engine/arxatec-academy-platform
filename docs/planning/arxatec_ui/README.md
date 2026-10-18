# Sistema visual y componentes

La aplicación usa `arxatec-ui` para logo, controles, menús, diálogos, tarjetas, tablas y estados. `src/index.css` carga primero el CSS del paquete y luego establece los estilos propios de Academy. El plugin de Vite ajusta el CSS de dependencia para conservar la tipografía sans de la plataforma.

## Patrones visibles

- `BrandLink` presenta el logo Academy y regresa al catálogo.
- `SiteHeader` ofrece catálogo, Mis cursos cuando hay sesión, idioma y tema; `AccountMenu` enlaza Perfil y las herramientas de administración para rol `ADMIN`.
- `PageShell` reúne cabecera, contenido y pie; acepta un ancho de lectura menor en lecciones.
- `AuthLayout` y `AuthCard` comparten presentación de las pantallas de acceso.
- `CourseCover` prioriza la imagen suministrada por el servicio y usa imágenes WebP locales como respaldo.
- `AsyncBoundary`, `ErrorScreen`, `LoadingScreen` y `StatusMessage` presentan los estados asíncronos de la interfaz.

Los textos visibles se traducen con `i18next`; los controles conservan estados de foco y las etiquetas accesibles de los componentes. Las páginas deben funcionar con el tema claro y oscuro y adaptarse a ancho móvil. Evita recrear con HTML y CSS propios un control que ya ofrece `arxatec-ui`.

El detalle sobre el header, el salto al contenido, la tarjeta de auth, el layout y estilos de lectura se mantiene en los documentos cercanos a sus componentes, por ejemplo `src/components/layout/page_shell/docs/README.md` y `src/components/shared/course_cover/docs/README.md`.
