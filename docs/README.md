# Documentación de Arxatec Academy

Arxatec Academy es la plataforma de formación de sus estudiantes. Esta documentación describe el código que vive en este repositorio: catálogo público, cursos y lecciones, progreso, comentarios, perfil y las herramientas disponibles para el personal administrador. Las cuentas y el aprendizaje son el centro del producto.

| Documento                                          | Contenido                                                     |
| -------------------------------------------------- | ------------------------------------------------------------- |
| [Arquitectura](ARCHITECTURE.md)                    | Organización del frontend, navegación, sesión y datos.        |
| [Estilo de código](CODE_STYLING.md)                | Convenciones para cambios nuevos.                             |
| [Decisiones](DECISIONS.md)                         | Decisiones vigentes del frontend.                             |
| [Entorno](ENV.md)                                  | Configuración pública y arranque local.                       |
| [Despliegue](DEPLOYMENT.md)                        | Build y requisitos de hosting estático.                       |
| [Rendimiento](PERFORMANCE.md)                      | Carga por rutas, imágenes y caché.                            |
| [Verificación](TESTING.md)                         | Comandos disponibles y cobertura observada en el repositorio. |
| [Idiomas](I18N.md)                                 | Español, inglés y portugués.                                  |
| [Planes de producto y módulos](planning/README.md) | Alcance actual de Academy y siguientes consideraciones.       |
| [Entrega](shipped/README.md)                       | Registro de cambios de este repositorio.                      |

La implementación comprobable está en `src/` y `package.json`. Los documentos de feature dentro de `src/modules/**/docs/README.md` explican el comportamiento particular y se actualizan con su código. Las especificaciones describen alcance; contrasta el comportamiento actual con `src/` y los contratos del servicio.

Este proyecto incluye una zona de administración de cursos, moderación, directorio de estudiantes y avisos, restringida por rol. Esas herramientas apoyan la experiencia Academy; no convierten el producto en un panel de gestión empresarial.
